// Every LLM call in Hookline goes through here, and through the Mubit gateway.
import OpenAI from "openai";
import type { z } from "zod";
import { db, migrate } from "./db";

export type Arm = "plain" | "stuffed" | "small";
export type TaskName = "teacher" | "coach" | "learner" | "gatecheck" | "mailer" | "caller" | "talker" | "intent" | "sly";

export type CallMeta = {
  model: string;
  requestId: string | null;
  inTok: number;
  outTok: number;
  ms: number;
  ttftMs: number;
};

type Chunk = {
  choices: { delta?: { content?: string | null } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number } | null;
};

export type Complete = (p: {
  arm: Arm;
  model: string;
  system: string;
  user: string;
  sessionId: string;
  temperature?: number;
}) => Promise<{ stream: AsyncIterable<Chunk>; requestId: string | null }>;

export function modelFor(task: TaskName, arm: Arm): string {
  if (arm === "small") return process.env.SMALL_MODEL || "openai/gpt-oss-20b";
  if (task === "coach" || task === "talker" || task === "intent" || task === "sly") return process.env.COACH_MODEL || "claude-haiku-4-5";
  return process.env.TEACHER_MODEL || "claude-haiku-4-5";
}

// Claude models go through Mubit's Anthropic route; streamed so we can time the first token.
const anthropicComplete: Complete = async ({ model, system, user, temperature }) => {
  const base = process.env.MUBIT_ANTHROPIC_BASE_URL || "https://api.mubit.ai/anthropic";
  const res = await fetch(`${base}/v1/messages`, {
    method: "POST",
    headers: { "x-api-key": process.env.MUBIT_API_KEY ?? "", "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 4096, system, stream: true, ...(temperature !== undefined && { temperature }), messages: [{ role: "user", content: user }] }),
  });
  if (!res.ok || !res.body) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = res.body;
  async function* chunks(): AsyncIterable<Chunk> {
    let buf = "", inTok = 0;
    const decoder = new TextDecoder();
    for await (const part of body as unknown as AsyncIterable<Uint8Array>) {
      buf += decoder.decode(part, { stream: true });
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        const ev = JSON.parse(line.slice(5));
        if (ev.type === "message_start") inTok = ev.message?.usage?.input_tokens ?? 0;
        if (ev.type === "content_block_delta" && ev.delta?.text) yield { choices: [{ delta: { content: ev.delta.text } }] };
        if (ev.type === "message_delta")
          yield { choices: [], usage: { prompt_tokens: inTok, completion_tokens: ev.usage?.output_tokens ?? 0 } };
      }
    }
  }
  return { stream: chunks(), requestId: res.headers.get("x-middleware-request-id") };
};

const clients: Partial<Record<"frontier" | "small", OpenAI>> = {};

// No metadata.session_id: OpenAI rejects it without store:true and Groq rejects it outright.
// Mubit then derives the session from the conversation start, one per single-turn call.
const mubitComplete: Complete = async (p) => {
  const { arm, model, system, user, temperature } = p;
  if (model.startsWith("claude")) return anthropicComplete(p);
  const kind = arm === "small" ? "small" : "frontier";
  clients[kind] ??= new OpenAI({
    apiKey: process.env.MUBIT_API_KEY,
    baseURL:
      kind === "small"
        ? process.env.MUBIT_GROQ_BASE_URL || "https://api.mubit.ai/compat/groq/v1"
        : process.env.MUBIT_OPENAI_BASE_URL || "https://api.mubit.ai/openai/v1",
  });
  const { data, response } = await clients[kind]!.chat.completions
    .create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      ...(temperature !== undefined && { temperature }),
      stream: true,
      stream_options: { include_usage: true },
    })
    .withResponse();
  return { stream: data as AsyncIterable<Chunk>, requestId: response.headers.get("x-middleware-request-id") };
};

function parseJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  // Models without a JSON mode sometimes wrap the object in a sentence.
  return JSON.parse(body.slice(body.indexOf("{"), body.lastIndexOf("}") + 1));
}

// Starter credit allows 4 calls in flight per project; stay under it and retry 429s.
// ponytail: per-process limit only; a second server process would need a shared limiter.
const MAX_IN_FLIGHT = 3;
let inFlight = 0;
const waiting: (() => void)[] = [];
async function slot<R>(fn: () => Promise<R>): Promise<R> {
  if (inFlight >= MAX_IN_FLIGHT) await new Promise<void>((r) => waiting.push(r));
  inFlight++;
  try {
    return await fn();
  } finally {
    inFlight--;
    waiting.shift()?.();
  }
}
const is429 = (e: unknown) => /\b429\b|starter_credit_busy|rate.?limit/i.test(String((e as Error)?.message ?? e)) || (e as { status?: number })?.status === 429;

export async function callLLM<T>(o: {
  task: TaskName;
  arm: Arm;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  sessionId: string;
  checks?: (t: T) => Record<string, boolean>;
  complete?: Complete;
  temperature?: number; // 0 for fixed-answer tasks, so the big model is consistent and an adapter can match it
}): Promise<{ ok: true; data: T; meta: CallMeta } | { ok: false; error: string; meta: CallMeta }> {
  const model = modelFor(o.task, o.arm);
  const meta: CallMeta = { model, requestId: null, inTok: 0, outTok: 0, ms: 0, ttftMs: 0 };
  let text = "";
  let error: string | null = null;
  let data: T | undefined;
  let checks: Record<string, boolean> = { schema: false };

  await slot(async () => {
    for (let attempt = 0; ; attempt++) {
      const start = performance.now(); // time only the attempt that answers, not retry waits
      try {
        const { stream, requestId } = await (o.complete ?? mubitComplete)({
          arm: o.arm, model, system: o.system, user: o.user, sessionId: o.sessionId, temperature: o.temperature,
        });
        meta.requestId = requestId;
        for await (const c of stream) {
          const piece = c.choices[0]?.delta?.content;
          if (piece) {
            if (!meta.ttftMs) meta.ttftMs = Math.round(performance.now() - start);
            text += piece;
          }
          if (c.usage) {
            meta.inTok = c.usage.prompt_tokens ?? 0;
            meta.outTok = c.usage.completion_tokens ?? 0;
          }
        }
        meta.ms = Math.round(performance.now() - start);
        return;
      } catch (e) {
        if (is429(e) && attempt < 4) {
          await new Promise((r) => setTimeout(r, 800 * 2 ** attempt + Math.random() * 400));
          continue;
        }
        error = e instanceof Error ? e.message : String(e);
        checks = { error: true };
        meta.ms = Math.round(performance.now() - start);
        return;
      }
    }
  });

  if (!error) {
    let raw: unknown;
    try {
      raw = parseJson(text);
    } catch {
      error = "not JSON";
    }
    const parsed = error ? null : o.schema.safeParse(raw);
    if (parsed?.success) {
      data = parsed.data;
      checks = { schema: true, ...(o.checks?.(data) ?? {}) };
    } else if (parsed) error = "schema: " + parsed.error.message.slice(0, 300);
  }
  // "info_" checks are recorded for the dashboard but don't fail the call.
  const ok = error === null && Object.entries(checks).every(([k, v]) => k.startsWith("info_") || v);

  // Logging must never turn a good answer into a failure.
  try {
  await migrate();
  await db().execute({
    sql: `INSERT INTO calls (task, arm, model, request_id, in_tok, out_tok, ms, ttft_ms, ok, checks, at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [o.task, o.arm, model, meta.requestId, meta.inTok, meta.outTok, meta.ms, meta.ttftMs, ok ? 1 : 0,
      JSON.stringify(checks), Date.now()],
  });
  } catch (e) {
    console.error("call log failed", e);
  }

  if (ok) return { ok: true, data: data as T, meta };
  return { ok: false, error: error ?? "checks failed: " + JSON.stringify(checks), meta };
}
