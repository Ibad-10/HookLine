// Distinct learner replies for adapter training: Claude writes them in many personas, so Mubit
// sees genuinely different examples rather than near-copies.
// Run: npx tsx --env-file=.env scripts/varied-replies.mts  (writes data/replies.json)
import { writeFileSync } from "node:fs";
import { z } from "zod";
import { callLLM } from "../src/lib/llm.ts";

const PERSONAS = [
  "a polite retired teacher in her seventies", "a busy parent on the school run", "a suspicious young man who works in IT",
  "a confused older man who is hard of hearing", "a chatty student", "a nurse just off a night shift",
  "a small shop owner who is distracted", "someone who recently lost money to a scam and is wary",
  "a trusting grandmother who wants to help", "a blunt builder on a building site", "a worried new immigrant whose English is basic",
  "a lawyer who asks pointed questions",
];
const out = new Set<string>();
for (const [i, p] of PERSONAS.entries()) {
  const r = await callLLM({
    task: "learner",
    arm: "plain",
    system: "You write realistic things people say on the phone, for a scam-awareness training app. Reply with JSON only.",
    user: JSON.stringify({ persona: p, want: "25 different short things this person might say to an unexpected caller from their bank, courier, broadband provider, a solicitor or an investment firm: greetings, questions, doubts, small talk, going along, refusing, getting upset. Under 20 words each. Never include real numbers.", format: '{"lines": ["..."]}' }),
    schema: z.object({ lines: z.array(z.string().max(160)) }),
    sessionId: `replies-${i}`,
  });
  if (r.ok) r.data.lines.forEach((l) => out.add(l.trim()));
  console.log(p, out.size);
}
writeFileSync("data/replies.json", JSON.stringify([...out], null, 1));
