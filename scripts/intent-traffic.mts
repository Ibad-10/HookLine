// Intent traffic from persona replies, against varied caller lines. Run: npx tsx --env-file=.env scripts/intent-traffic.mts
import { readFileSync } from "node:fs";
import { SCENARIOS } from "../src/lib/call/scenarios.ts";
import { labelIntent } from "../src/lib/tasks/coach.ts";
const replies: string[] = JSON.parse(readFileSync("data/replies.json", "utf8"));
const lines = Object.values(SCENARIOS).flatMap((sc) => Object.values(sc.nodes).filter((n) => !n.end).map((n) => n.line));
let next = 0, ok = 0;
const worker = async () => { while (next < replies.length) { const i = next++; if (await labelIntent(lines[(i * 7) % lines.length], replies[i], `intent-traffic-${i}`)) ok++; } };
await Promise.all([worker(), worker(), worker()]);
console.log(`intent: ${ok}/${replies.length}`);
