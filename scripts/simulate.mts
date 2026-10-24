// Simulated learners. Writes data/sim-result.json for the dashboard.
// With --live N, also sends N real Teacher calls (frontier) through Mubit: the training traffic.
// Run: npx tsx --env-file=.env scripts/simulate.mts --users 200 --live 60
import { mkdirSync, writeFileSync } from "node:fs";
import seeds from "../src/data/seed-briefs.json" with { type: "json" };
import { Brief } from "../src/lib/schemas.ts";
import { makeUsers, rng, simulate } from "../src/lib/sim.ts";
import { writeLesson } from "../src/lib/tasks/teacher.ts";
import { CATEGORIES } from "../src/lib/taxonomy.ts";

const arg = (k: string, d: number) => Number(process.argv[process.argv.indexOf(k) + 1] ?? d) || d;
const users = arg("--users", 200), live = process.argv.includes("--live") ? arg("--live", 0) : 0;

const res = simulate({ users, rounds: 20, seed: 1 });
mkdirSync("data", { recursive: true });
writeFileSync("data/sim-result.json", JSON.stringify({ ...res, at: new Date().toISOString() }, null, 2));
const s = [...res.quizzesToFind].sort((a, b) => a - b);
console.log(`users ${users}: found ${(res.foundShare * 100).toFixed(1)}%, median quizzes ${s[s.length >> 1]}, targeted ${(res.targetedShare * 100).toFixed(1)}%`);

if (live) {
  const rand = rng(7);
  const people = makeUsers(live, rand);
  const briefs = seeds.map((b) => Brief.parse(b));
  let ok = 0, done = 0;
  const one = async (i: number) => {
    const u = people[i];
    const brief = briefs[Math.floor(rand() * briefs.length)];
    const known = CATEGORIES.filter((c) => !u.hidden.includes(c)).slice(0, 2 + (i % 3));
    const arm = i % 4 === 3 ? "stuffed" : "plain";
    const history = u.hidden.map((h, k) => `2026-10-${10 + k}: missed a ${h} question`);
    const l = await writeLesson(brief, { weak: u.hidden, known }, arm, u.id, history);
    ok += l ? 1 : 0;
    console.log(`${++done}/${live} ${arm} ${l ? "ok" : "rejected"}`);
  };
  for (let i = 0; i < live; i += 3) await Promise.all([i, i + 1, i + 2].filter((j) => j < live).map(one));
  console.log(`live teacher calls: ${ok}/${live} kept by our checks`);
}
