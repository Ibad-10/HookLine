// Learner session and lesson selection, shared by routes and server pages.
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db, migrate } from "./db";
import { loadSkills, pickNext, whyText, type Pick, type Skill } from "./profile";
import { Brief, Lesson } from "./schemas";
import seedBriefs from "../data/seed-briefs.json";
import seedLessons from "../data/seed-lessons.json";
import { CATEGORIES } from "./taxonomy";
import { writeLesson } from "./tasks/teacher";

export const COOKIE = "hl_id";

export async function learnerId(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

export async function getLearner(id: string) {
  await migrate();
  const r = await db().execute({ sql: "SELECT * FROM learners WHERE id = ?", args: [id] });
  return r.rows[0] ?? null;
}

export async function createLearner(o: { nickname: string; age_band: string; services: string[] }): Promise<string> {
  await migrate();
  const id = randomUUID();
  await db().execute({
    sql: "INSERT INTO learners (id, nickname, age_band, services, lang, created_at) VALUES (?, ?, ?, ?, 'en', ?)",
    args: [id, o.nickname, o.age_band, JSON.stringify(o.services), Date.now()],
  });
  return id;
}

// Every category, seen or not, so the picker can choose unseen ones too.
export async function allSkills(id: string): Promise<Skill[]> {
  const seen = await loadSkills(id);
  return CATEGORIES.map((key) => seen.find((s) => s.key === key) ?? { key, correct: 0, seen: 0, box: 0, due_at: 0 });
}

export function seedLesson(category: string): Lesson {
  return Lesson.parse((seedLessons as Record<string, unknown>)[category] ?? Object.values(seedLessons)[0]);
}

async function briefFor(category: string): Promise<{ id: string; brief: Brief }> {
  const r = await db().execute({
    sql: "SELECT id, brief_json FROM briefs WHERE category = ? ORDER BY published_at DESC LIMIT 1",
    args: [category],
  });
  if (r.rows[0]) return { id: String(r.rows[0].id), brief: Brief.parse(JSON.parse(String(r.rows[0].brief_json))) };
  return { id: `seed-${category}`, brief: Brief.parse(seedBriefs.find((b) => b.category === category)) };
}

export type NextLesson = { lessonId: string; category: string; why: string; brief: Brief; lesson: Lesson };

export async function nextLesson(id: string, now = Date.now(), topic?: string): Promise<NextLesson> {
  await migrate();
  const skills = await allSkills(id);
  const chosen = topic && (CATEGORIES as readonly string[]).includes(topic) ? skills.find((s) => s.key === topic) : undefined;
  const pick: Pick = chosen ? { key: chosen.key, reason: chosen.seen > chosen.correct ? "weak" : "due" } : pickNext(skills, now, 3)[0];
  const lastMissRow = await db().execute({
    sql: "SELECT key, at FROM events WHERE learner_id = ? AND key = ? AND ok = 0 ORDER BY at DESC LIMIT 1",
    args: [id, pick.key],
  });
  const lastMiss = lastMissRow.rows[0] ? { key: String(lastMissRow.rows[0].key), at: Number(lastMissRow.rows[0].at) } : undefined;
  let { id: briefId, brief } = await briefFor(pick.key);

  const existing = await db().execute({
    sql: "SELECT id, lesson_json FROM lessons WHERE learner_id = ? AND brief_id = ? ORDER BY created_at DESC LIMIT 1",
    args: [id, briefId],
  });
  // A repeat gets a fresh lesson; only reuse one the learner hasn't finished.
  const done = await db().execute({ sql: "SELECT 1 FROM events WHERE learner_id = ? AND detail = ? LIMIT 1", args: [id, String(existing.rows[0]?.id ?? "")] });
  let lessonId: string, lesson: Lesson;
  if (existing.rows[0] && !done.rows[0]) {
    lessonId = String(existing.rows[0].id);
    lesson = Lesson.parse(JSON.parse(String(existing.rows[0].lesson_json)));
  } else {
    const weak = skills.filter((s) => s.seen > s.correct).map((s) => s.key);
    const known = skills.filter((s) => s.seen > 0 && s.correct === s.seen).map((s) => s.key);
    // ponytail: 20s cap on the live Teacher call, seed lesson after that; stream the lesson if users wait too long.
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), 20_000));
    const fresh = await Promise.race([writeLesson(brief, { weak, known }, "plain", id), timeout]);
    lesson = fresh ?? seedLesson(pick.key);
    // The backup lesson is credited to its own backup brief, never to this week's report.
    if (!fresh) ({ id: briefId, brief } = { id: `seed-${pick.key}`, brief: Brief.parse(seedBriefs.find((b) => b.category === pick.key)) });
    lessonId = randomUUID();
    await db().execute({
      sql: "INSERT INTO lessons (id, brief_id, learner_id, lesson_json, arm, created_at) VALUES (?, ?, ?, ?, 'plain', ?)",
      args: [lessonId, briefId, id, JSON.stringify(lesson), now],
    });
  }
  return { lessonId, category: pick.key, why: whyText(pick, lastMiss, (skills.find((s) => s.key === pick.key)?.seen ?? 0) === 0), brief, lesson };
}

// "seed:<category>" addresses the built-in lessons used by the starting quiz.
export async function lessonById(lessonId: string): Promise<{ lesson: Lesson; category: string } | null> {
  if (lessonId.startsWith("seed:")) {
    const category = lessonId.slice(5);
    return (CATEGORIES as readonly string[]).includes(category) ? { lesson: seedLesson(category), category } : null;
  }
  await migrate();
  const r = await db().execute({
    sql: "SELECT l.lesson_json, l.brief_id, b.category FROM lessons l LEFT JOIN briefs b ON b.id = l.brief_id WHERE l.id = ?",
    args: [lessonId],
  });
  if (!r.rows[0]) return null;
  const lesson = Lesson.parse(JSON.parse(String(r.rows[0].lesson_json)));
  const category = String(r.rows[0].category ?? String(r.rows[0].brief_id).replace(/^seed-/, ""));
  return { lesson, category };
}
