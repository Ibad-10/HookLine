// Coach traffic from the varied persona replies in data/replies.json, both model sides, so the
// two call-coach adapters get fresh, distinct examples. Run: npx tsx --env-file=.env scripts/coach-traffic2.mts 240
import { readFileSync } from "node:fs";
import { startCall } from "../src/lib/call/engine.ts";
import { SCENARIOS } from "../src/lib/call/scenarios.ts";
import type { Arm } from "../src/lib/llm.ts";
import { coachMove } from "../src/lib/tasks/coach.ts";

const replies: string[] = JSON.parse(readFileSync("data/replies.json", "utf8"));
const n = Number(process.argv[2] ?? 240);
const scenarios = Object.values(SCENARIOS);
let ok = 0, next = 0;
const one = async (i: number) => {
  const sc = scenarios[i % scenarios.length];
  const nodes = Object.keys(sc.nodes).filter((k) => !sc.nodes[k].end);
  const state = { ...startCall(sc), node: nodes[(i * 5) % nodes.length] };
  const arm: Arm = i % 2 ? "small" : "plain";
  if (await coachMove(state, sc, replies[Math.floor(i / 2) % replies.length], `coach-traffic2-${i}`, arm).catch(() => null)) ok++;
};
const worker = async () => { while (next < n) await one(next++); };
await Promise.all([worker(), worker(), worker()]);
console.log(`coach calls: ${ok}/${n} answered`);
