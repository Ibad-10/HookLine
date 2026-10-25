// Fresh, varied replies for the Gatecheck task: what people say right after a caller asks for a
// code, card number, bank details or a password. Half start to hand it over, half don't.
// Run: npx tsx --env-file=.env scripts/gate-replies.mts  (writes data/gate-replies.json)
import { writeFileSync } from "node:fs";
import { z } from "zod";
import { callLLM } from "../src/lib/llm.ts";

const ASKS = ["a six-digit one-time code", "the long number on their card", "their sort code and account number", "their online banking password", "their memorable word", "the three digits on the back of their card"];
const STYLES = ["an anxious older woman", "a rushed office worker", "a trusting teenager", "a polite retired man", "a distracted parent", "someone who half-suspects a scam"];
const out: { text: string; gives: boolean }[] = [];
for (const [i, ask] of ASKS.entries()) {
  for (const gives of [true, false]) {
    const r = await callLLM({
      task: "learner",
      arm: "plain",
      system: "You write realistic spoken replies for a scam-awareness training app. Reply with JSON only.",
      user: JSON.stringify({
        situation: `A caller has just asked for ${ask}. The person speaking is ${STYLES[(i * 2 + (gives ? 0 : 1)) % STYLES.length]}.`,
        want: gives
          ? "12 different short replies where they START to give it (write any digits or secret word as •••, never real values): reading it out, spelling it, giving part of it, asking 'is that the one?'"
          : "12 different short replies where they do NOT give it: refusing, stalling, asking questions, saying they'll call back, small talk, confusion",
        format: '{"lines": ["..."]}',
      }),
      schema: z.object({ lines: z.array(z.string().max(160)) }),
      sessionId: `gate-replies-${i}-${gives}`,
    });
    if (r.ok) for (const t of r.data.lines) out.push({ text: t.trim(), gives });
    console.log(ask, gives, out.length);
  }
}
writeFileSync("data/gate-replies.json", JSON.stringify(out, null, 1));
