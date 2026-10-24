// Coach and live-caller turns using Claude-written persona replies (data/replies.json), on both
// coach models, so each Mubit task sees genuinely different examples.
// Run: npx tsx --env-file=.env scripts/persona-traffic.mts
import { readFileSync } from "node:fs";
import { startCall } from "../src/lib/call/engine.ts";
import { SCENARIOS } from "../src/lib/call/scenarios.ts";
import type { Arm } from "../src/lib/llm.ts";
import { coachMove, talkMove } from "../src/lib/tasks/coach.ts";

const replies: string[] = JSON.parse(readFileSync("data/replies.json", "utf8"));
const scs = Object.values(SCENARIOS);
const jobs: (() => Promise<unknown>)[] = [];
replies.forEach((said, i) => {
  const sc = scs[i % scs.length];
  const nodes = Object.keys(sc.nodes).filter((k) => !sc.nodes[k].end);
  const state = { ...startCall(sc), node: nodes[(i * 5) % nodes.length] };
  const arm: Arm = i % 2 ? "small" : "plain";
  jobs.push(() => coachMove(state, sc, said, `persona-coach-${i}`, arm));
  jobs.push(() => talkMove(state, sc, said, `persona-talk-${i}`));
});
let next = 0, ok = 0;
const worker = async () => { while (next < jobs.length) if (await jobs[next++]().catch(() => null)) ok++; };
await Promise.all([worker(), worker(), worker()]);
console.log(`persona traffic: ${ok}/${jobs.length} answered`);
