// Live check: one call per arm through Mubit. Run: npx tsx --env-file=.env scripts/smoke.mts
import { z } from "zod";
import { callLLM, type Arm } from "../src/lib/llm.ts";

const SYSTEM = "Hookline smoke test. Reply with JSON {\"ok\": true}.";
for (const arm of ["plain", "stuffed", "small"] as Arm[]) {
  const r = await callLLM({ task: "learner", arm, system: SYSTEM, user: "ping", sessionId: "smoke",
    schema: z.object({ ok: z.boolean() }) });
  console.log(arm, r.ok, r.meta.model, r.meta.requestId, `${r.meta.ms}ms ttft ${r.meta.ttftMs}ms`, r.ok ? "" : r.error);
}
