// Every LLM call in Hookline goes through here, and through the Mubit gateway.
import OpenAI from "openai";
import type { z } from "zod";
import { db, migrate } from "./db";

export type Arm = "plain" | "stuffed" | "small";
export type TaskName = "teacher" | "coach" | "learner" | "gatecheck";

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
}) => Promise<{ stream: AsyncIterable<Chunk>; requestId: string | null }>;

export function modelFor(task: TaskName, arm: Arm): string {
  if (arm === "small") return process.env.SMALL_MODEL || "openai/gpt-oss-20b";
  if (task === "coach") return process.env.COACH_MODEL || "gpt-6-luna";
  return process.env.TEACHER_MODEL || "gpt-6-luna";
}

const clients: Partial<Record<"frontier" | "small", OpenAI>> = {};

// No metadata.session_id: OpenAI rejects it without store:true and Groq rejects it outright.
// Mubit then derives the session from the conversation start, one per single-turn call.
const mubitComplete: Complete = async ({ arm, model, system, user }) => {
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
      stream: true,
      stream_options: { include_usage: true },
    })
    .withResponse();
  return { stream: data as AsyncIterable<Chunk>, requestId: response.headers.get("x-middleware-request-id") };
};

function parseJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(fenced ? fenced[1] : text);
}

export async function callLLM<T>(o: {
  task: TaskName;
  arm: Arm;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  sessionId: string;
  checks?: (t: T) => Record<string, boolean>;
  complete?: Complete;
}): Promise<{ ok: true; data: T; meta: CallMeta } | { ok: false; error: string; meta: CallMeta }> {
  const model = modelFor(o.task, o.arm);
  const meta: CallMeta = { model, requestId: null, inTok: 0, outTok: 0, ms: 0, ttftMs: 0 };
  const start = performance.now();
  let text = "";
  let error: string | null = null;
  let data: T | undefined;
  let checks: Record<string, boolean> = { schema: false };

  try {
    const { stream, requestId } = await (o.complete ?? mubitComplete)({
      arm: o.arm, model, system: o.system, user: o.user, sessionId: o.sessionId,
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
    const parsed = o.schema.safeParse(parseJson(text));
    if (parsed.success) {
      data = parsed.data;
      checks = { schema: true, ...(o.checks?.(data) ?? {}) };
    } else error = "schema: " + parsed.error.message.slice(0, 300);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  meta.ms = Math.round(performance.now() - start);
  const ok = error === null && Object.values(checks).every(Boolean);

  await migrate();
  await db().execute({
    sql: `INSERT INTO calls (task, arm, model, request_id, in_tok, out_tok, ms, ttft_ms, ok, checks, at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [o.task, o.arm, model, meta.requestId, meta.inTok, meta.outTok, meta.ms, meta.ttftMs, ok ? 1 : 0,
      JSON.stringify(checks), Date.now()],
  });

  if (ok) return { ok: true, data: data as T, meta };
  return { ok: false, error: error ?? "checks failed: " + JSON.stringify(checks), meta };
}
