// Simulated learners with hidden weak spots set in code. The only claim this
// supports: how many quizzes the profile needs to find each weak spot, and
// whether the picker then targets it. Not "scores go up".
import { pickNext, record, weakness, type Skill } from "./profile";
import { CATEGORIES } from "./taxonomy";

export type SimResult = { quizzesToFind: number[]; foundShare: number; targetedShare: number; users: number; rounds: number };
export type SimUser = { id: string; hidden: string[] };

export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeUsers(n: number, rand: () => number): SimUser[] {
  return Array.from({ length: n }, (_, i) => {
    const k = 1 + Math.floor(rand() * 3);
    const pool = [...CATEGORIES];
    const hidden = Array.from({ length: k }, () => pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    return { id: `sim-${i}`, hidden };
  });
}

const DAY = 86_400_000;

export function simulate(o: { users: number; rounds: number; seed: number }): SimResult {
  const rand = rng(o.seed);
  const users = makeUsers(o.users, rand);
  const quizzesToFind: number[] = [];
  let hiddenTotal = 0, weakPicks = 0, weakHits = 0;

  for (const u of users) {
    let skills: Skill[] = CATEGORIES.map((key) => ({ key, correct: 0, seen: 0, box: 0, due_at: 0 }));
    const found = new Map<string, number>();
    hiddenTotal += u.hidden.length;
    for (let round = 0; round < o.rounds; round++) {
      const now = round * DAY;
      for (const p of pickNext(skills, now)) {
        if (p.reason === "weak") (weakPicks++, u.hidden.includes(p.key) && weakHits++);
        const ok = rand() < (u.hidden.includes(p.key) ? 0.3 : 0.9);
        skills = skills.map((s) => (s.key === p.key ? record(s, ok, now) : s));
      }
      const top = [...skills].filter((s) => s.seen > 0).sort((a, b) => weakness(b) - weakness(a)).slice(0, 3);
      for (const h of u.hidden) if (!found.has(h) && top.some((s) => s.key === h)) found.set(h, round + 1);
    }
    quizzesToFind.push(...found.values());
  }
  return {
    quizzesToFind,
    foundShare: quizzesToFind.length / hiddenTotal,
    targetedShare: weakPicks ? weakHits / weakPicks : 0,
    users: o.users,
    rounds: o.rounds,
  };
}
