// Varied traffic for every Mubit task, built from the real scam briefs in the database, so each
// task collects distinct kept examples and can train an adapter.
// Run: npx tsx --env-file=.env scripts/train-all.mts [perBrief=2] [tasks=teacher,mailer,caller,gatecheck]
// Reads briefs from the real database; everything the tasks write goes to a scratch local file.
import { createClient } from "@libsql/client";
import { TECHNIQUES } from "../src/lib/taxonomy.ts";

const per = Number(process.argv[2] ?? 2);
const only = (process.argv[3] ?? "teacher,mailer,caller,gatecheck").split(",");
const live = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN });
const briefs = (await live.execute("SELECT brief_json FROM briefs")).rows.map((r) => JSON.parse(String(r.brief_json)));
console.log("briefs:", briefs.length);

process.env.DATABASE_URL = "file:data/train.db";
process.env.DATABASE_AUTH_TOKEN = "";
const { writeLesson } = await import("../src/lib/tasks/teacher.ts");
const { writeEmail } = await import("../src/lib/tasks/mailer.ts");
const { writeCall } = await import("../src/lib/tasks/caller.ts");
const { gateCheck } = await import("../src/lib/tasks/coach.ts");

const pick = <T,>(a: readonly T[], i: number, n: number) => Array.from({ length: n }, (_, k) => a[(i * 3 + k * 5) % a.length]);
const jobs: [string, () => Promise<unknown>][] = [];
briefs.forEach((b, i) => {
  for (let v = 0; v < per; v++) {
    const weak = pick(TECHNIQUES, i + v, 2);
    if (only.includes("teacher")) jobs.push(["teacher", () => writeLesson(b, { weak, known: pick(TECHNIQUES, i + v + 4, 1) }, "plain", `train-teacher-${i}-${v}`)]);
    if (only.includes("mailer")) jobs.push(["mailer", () => writeEmail(b, v ? [`Account notice ${i}`] : [], `train-mailer-${i}-${v}`)]);
    if (only.includes("caller")) jobs.push(["caller", () => writeCall(b, weak, `train-${i}-${v}`)]);
  }
});
const replies = [
  "it's my dog's name, rover", "the code is •••", "I'd rather not say", "my mother's maiden name is Smith",
  "hang on, I'll get my card", "the long number starts •••", "no, I won't give that", "my password is sunshine1",
  "sort code •••, account •••", "what code?", "I'm not reading that out", "it says your code is •••",
  "the three numbers on the back are •••", "my memorable word is", "sure, the expiry is •••", "I don't have it",
];
if (only.includes("gatecheck"))
  replies.forEach((r, i) => ["code", "card", "bank", "password"].forEach((ask, k) => jobs.push(["gatecheck", () => gateCheck(r, ask, `train-gate-${i}-${k}`)])));

const done: Record<string, [number, number]> = {};
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const [task, run] = jobs[next++];
    const ok = await run().catch(() => null);
    done[task] = [(done[task]?.[0] ?? 0) + (ok ? 1 : 0), (done[task]?.[1] ?? 0) + 1];
  }
}
await Promise.all([worker(), worker(), worker()]);
console.log(Object.entries(done).map(([t, [ok, n]]) => `${t}: ${ok}/${n}`).join("  "));
