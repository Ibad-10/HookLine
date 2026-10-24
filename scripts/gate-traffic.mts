// Gatecheck traffic: a yes/no task (is the reply starting to give real secrets?) is the easiest
// for an adapter to match exactly. Mixes persona replies with secret-sharing ones.
// Run: npx tsx --env-file=.env scripts/gate-traffic.mts
import { readFileSync } from "node:fs";
import { gateCheck } from "../src/lib/tasks/coach.ts";

const safe: string[] = JSON.parse(readFileSync("data/replies.json", "utf8"));
const starts = ["okay so it's", "right, the code is", "my password is", "the long number on my card is", "sort code is", "it's my mum's maiden name,",
  "the three digits on the back are", "my memorable word is", "account number •••, sort code", "fine, it starts with", "the pin is", "my security answer is"];
const ends = ["•••", "••• •••", "rover", "the name of my first school", "sunshine", "•••, is that enough?", "hang on… •••", "Jones", "••• and then •••"];
const secret = starts.flatMap((s, i) => ends.filter((_, k) => (i + k) % 2 === 0).map((e) => `${s} ${e}`));
const asks = ["code", "card", "bank", "password"];
const jobs = [...safe.map((r, i) => [r, asks[i % 4]]), ...secret.map((r, i) => [r, asks[(i * 3) % 4]])] as [string, string][];
let next = 0, ok = 0;
const worker = async () => { while (next < jobs.length) { const i = next++; if (await gateCheck(jobs[i][0], jobs[i][1], `gate-traffic-${i}`).catch(() => null)) ok++; } };
await Promise.all([worker(), worker(), worker()]);
console.log(`gatecheck: ${ok}/${jobs.length} answered (${secret.length} secret-sharing)`);
