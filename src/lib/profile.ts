// Weak-spot profile and spaced repeats (fixed Leitner ladder, see docs/research/learning-app-mechanics.md).
import { db, migrate } from "./db";
import { LABELS } from "./taxonomy";

export type Skill = { key: string; correct: number; seen: number; box: number; due_at: number };
export type Pick = { key: string; reason: "weak" | "due" | "known" };

const DAY = 86_400_000;
export const INTERVAL_DAYS = [0, 2, 7, 21, 30];

export function record(s: Skill, ok: boolean, now: number): Skill {
  const box = ok ? Math.min(4, s.box + 1) : 1;
  return { ...s, seen: s.seen + 1, correct: s.correct + (ok ? 1 : 0), box, due_at: now + INTERVAL_DAYS[box] * DAY };
}

export function weakness(s: Skill): number {
  return (s.seen - s.correct + 1) / (s.seen + 2);
}

export function pickNext(skills: Skill[], now: number, n = 3): Pick[] {
  const weak = skills.filter((s) => weakness(s) > 0.5).sort((a, b) => weakness(b) - weakness(a));
  const picks: Pick[] = weak.slice(0, Math.max(1, Math.round(n / 3))).map((s) => ({ key: s.key, reason: "weak" }));
  const rest = skills.filter((s) => !picks.some((p) => p.key === s.key)).sort((a, b) => a.due_at - b.due_at);
  for (const s of rest) {
    if (picks.length >= n) break;
    if (s.due_at <= now) picks.push({ key: s.key, reason: "due" });
  }
  for (const s of rest) {
    if (picks.length >= n) break;
    if (!picks.some((p) => p.key === s.key)) picks.push({ key: s.key, reason: "known" });
  }
  return picks;
}

export function whyText(pick: Pick, lastMiss?: { key: string; at: number }, isNew = false): string {
  const topic = (LABELS as Record<string, string>)[pick.key]?.toLowerCase() ?? pick.key;
  if (pick.reason === "weak") {
    if (lastMiss?.key === pick.key) {
      const day = new Date(lastMiss.at).toLocaleDateString("en-GB", { weekday: "long" });
      return `${capital(topic)} caught you out on ${day}, so we're practising it again today.`;
    }
    return `${capital(topic)} is one to practise, so it's in today's session.`;
  }
  if (isNew) return `Something new: ${topic}. A quick look at how this one works.`;
  if (pick.reason === "due") return `A quick refresher on ${topic}, so it stays fresh.`;
  return `Something new on ${topic}, which you already know well.`;
}

const capital = (s: string) => s[0].toUpperCase() + s.slice(1);

// Starting weights from the sign-up questions; higher = practise sooner.
export function priorsFor(ageBand: string, services: string[]): Record<string, number> {
  const p: Record<string, number> = {};
  const bump = (k: string) => (p[k] = (p[k] ?? 0) + 1);
  if (services.includes("online_banking")) bump("bank_impersonation"), bump("account_takeover_code");
  if (services.includes("marketplace")) bump("marketplace_purchase");
  if (services.includes("dating")) bump("romance");
  if (services.includes("crypto")) bump("investment_crypto");
  if (services.includes("job_hunting")) bump("job_task");
  if (services.includes("parcels")) bump("delivery_fee");
  if (ageBand === "65+") bump("tech_support"), bump("family_emergency"), bump("bank_impersonation");
  if (ageBand === "18-34") bump("job_task"), bump("marketplace_purchase");
  return p;
}

export async function loadSkills(learnerId: string): Promise<Skill[]> {
  await migrate();
  const r = await db().execute({ sql: "SELECT key, correct, seen, box, due_at FROM skills WHERE learner_id = ?", args: [learnerId] });
  return r.rows.map((row) => ({
    key: String(row.key), correct: Number(row.correct), seen: Number(row.seen), box: Number(row.box), due_at: Number(row.due_at),
  }));
}

export async function saveOutcome(learnerId: string, keys: string[], ok: boolean, kind = "quiz", now = Date.now()) {
  const skills = await loadSkills(learnerId);
  for (const key of keys) {
    const s = record(skills.find((x) => x.key === key) ?? { key, correct: 0, seen: 0, box: 0, due_at: now }, ok, now);
    await db().batch([
      { sql: `INSERT INTO skills (learner_id, key, correct, seen, box, due_at) VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT (learner_id, key) DO UPDATE SET correct = excluded.correct, seen = excluded.seen, box = excluded.box, due_at = excluded.due_at`,
        args: [learnerId, key, s.correct, s.seen, s.box, s.due_at] },
      { sql: "INSERT INTO events (learner_id, kind, key, ok, at) VALUES (?, ?, ?, ?, ?)", args: [learnerId, kind, key, ok ? 1 : 0, now] },
    ], "write");
  }
}
