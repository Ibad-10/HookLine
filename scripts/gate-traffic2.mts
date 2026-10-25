// Gatecheck traffic from data/gate-replies.json, each reply paired with the ask it answers.
// Run: npx tsx --env-file=.env scripts/gate-traffic2.mts
import { readFileSync } from "node:fs";
import { gateCheck } from "../src/lib/tasks/coach.ts";
const rows: { text: string; gives: boolean }[] = JSON.parse(readFileSync("data/gate-replies.json", "utf8"));
const asks = ["code", "card", "bank", "password"];
let next = 0, ok = 0;
const worker = async () => { while (next < rows.length) { const i = next++; if (await gateCheck(rows[i].text, asks[Math.floor(i / 24) % 4], `gate2-${i}`).catch(() => null)) ok++; } };
await Promise.all([worker(), worker(), worker()]);
console.log(`gatecheck: ${ok}/${rows.length}`);
