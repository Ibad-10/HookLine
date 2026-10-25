// OpenAI-compatible chat endpoint used as the ElevenLabs agent's custom LLM. Streams SSE.
// Only ElevenLabs (holding our shared secret) may call it.
import { agentPrompt, mask, safetyExit } from "@/lib/agent";
import { getScenario } from "@/lib/call/getScenario";
import type { Scenario } from "@/lib/call/types";
import { db, migrate } from "@/lib/db";
import { saveOutcome } from "@/lib/profile";

type Msg = { role: string; content: string | null };
const enc = new TextEncoder();
const chunk = (delta: object, finish: string | null = null) =>
  enc.encode(`data: ${JSON.stringify({ id: "hl", object: "chat.completion.chunk", choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`);
const endCall = (reason: string) =>
  chunk({ tool_calls: [{ index: 0, id: `end-${Date.now()}`, type: "function", function: { name: "end_call", arguments: JSON.stringify({ reason }) } }] }, "tool_calls");

async function record(learner: string, sc: Scenario | null, ok: boolean) {
  if (learner && sc) await saveOutcome(learner, [sc.category], ok, "phone").catch(() => undefined);
}

export async function POST(req: Request) {
  if (!process.env.AGENT_SECRET || req.headers.get("x-hookline-agent") !== process.env.AGENT_SECRET) return new Response("forbidden", { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { messages?: Msg[]; elevenlabs_extra_body?: { scenario?: string; learner?: string; mode?: string } };
  const extra = body.elevenlabs_extra_body ?? {};
  const sc = await getScenario(extra.scenario ?? "");
  const learner = extra.learner ?? "";
  const turns = (body.messages ?? []).filter((m) => (m.role === "user" || m.role === "assistant") && m.content);
  const said = [...turns].reverse().find((m) => m.role === "user")?.content ?? "";
  const t0 = Date.now();

  const stream = new ReadableStream({
    async start(ctl) {
      const finish = () => {
        ctl.enqueue(enc.encode("data: [DONE]\n\n"));
        ctl.close();
      };
      const callerLine = [...turns].reverse().find((m) => m.role === "assistant")?.content ?? "";
      // A code-reading call: the code was in the opening line; just say goodbye and hang up.
      if (extra.mode === "code") {
        ctl.enqueue(chunk({ role: "assistant", content: "Goodbye." }));
        ctl.enqueue(endCall("code read"));
        return finish();
      }
      const exit = safetyExit(said, String(callerLine));
      if (exit || !sc) {
        ctl.enqueue(chunk({ role: "assistant", content: exit?.say ?? "Sorry, wrong number." }));
        ctl.enqueue(endCall(exit?.kind ?? "error"));
        if (exit) await record(learner, sc, exit.kind === "pass");
        console.log("agent turn", { exit: exit?.kind ?? "no-scenario", ms: Date.now() - t0 });
        return finish();
      }
      // Only masked learner text ever reaches the model. Claude needs the first turn to be the user's.
      const messages = turns.map((m) => ({ role: m.role, content: m.role === "user" ? mask(String(m.content)) : String(m.content) }));
      if (messages[0]?.role === "assistant") messages.unshift({ role: "user", content: "(the call connects)" });
      const base = process.env.MUBIT_ANTHROPIC_BASE_URL || "https://api.mubit.ai/anthropic";
      const model = process.env.COACH_MODEL || "claude-haiku-4-5";
      const res = await fetch(`${base}/v1/messages`, {
        method: "POST",
        headers: { "x-api-key": process.env.MUBIT_API_KEY ?? "", "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model, max_tokens: 200, system: agentPrompt(sc), stream: true, messages }),
      }).catch(() => null);
      if (!res?.ok || !res.body) {
        console.error("agent turn: model failed", res?.status);
        ctl.enqueue(chunk({ role: "assistant", content: "Sorry, the line's bad. Are you still there?" }));
        return finish();
      }
      // Hold back the first few characters to catch an END_ marker, then stream straight through.
      let head = "", decided = false, end: "safe" | "scammed" | null = null, buf = "", ttft = 0, out = 0;
      const dec = new TextDecoder();
      const emit = (t: string) => {
        if (!t) return;
        out += t.length;
        ctl.enqueue(chunk({ content: t }));
      };
      for await (const part of res.body as unknown as AsyncIterable<Uint8Array>) {
        buf += dec.decode(part, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const ev = JSON.parse(line.slice(5));
          if (ev.type !== "content_block_delta" || !ev.delta?.text) continue;
          ttft ||= Date.now() - t0;
          if (decided) {
            emit(ev.delta.text);
            continue;
          }
          head += ev.delta.text;
          const m = head.match(/^\s*END_(SAFE|SCAMMED):\s*/);
          if (m) {
            end = m[1] === "SAFE" ? "safe" : "scammed";
            decided = true;
            emit(head.slice(m[0].length));
          } else if (!"END_SCAMMED:".startsWith(head.trimStart().slice(0, 12)) && !"END_SAFE:".startsWith(head.trimStart().slice(0, 9))) {
            decided = true;
            emit(head);
          }
        }
      }
      if (!decided) emit(head);
      if (end) {
        ctl.enqueue(endCall(end));
        await record(learner, sc, end === "safe");
      }
      await migrate();
      await db()
        .execute({
          sql: "INSERT INTO calls (task, arm, model, request_id, in_tok, out_tok, ms, ttft_ms, ok, checks, at) VALUES ('agent', 'plain', ?, null, 0, ?, ?, ?, 1, '{}', ?)",
          args: [model, Math.round(out / 4), Date.now() - t0, ttft, Date.now()],
        })
        .catch(() => undefined);
      console.log("agent turn", { s: sc.id, end, ttft, ms: Date.now() - t0 });
      finish();
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache" } });
}
