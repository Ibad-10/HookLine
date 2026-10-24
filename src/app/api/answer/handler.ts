import { z } from "zod";
import { db, migrate } from "@/lib/db";
import { grade } from "@/lib/grade";
import { lessonById } from "@/lib/learner";
import { saveOutcome } from "@/lib/profile";

const Body = z.object({
  lessonId: z.string().max(80),
  q: z.number().int().min(0).max(10),
  choice: z.number().int().min(0).max(5).optional(),
  spans: z.array(z.string().max(300)).max(40).optional(),
  last: z.boolean().optional(),
});

// Grading happens here, in code, against the stored answer key.
export async function answer(learner: string, raw: unknown): Promise<{ status: number; body: unknown }> {
  const b = Body.safeParse(raw);
  if (!b.success) return { status: 400, body: { error: "bad request" } };
  const found = await lessonById(b.data.lessonId);
  const q = found?.lesson.quiz[b.data.q];
  if (!found || !q) return { status: 404, body: { error: "unknown question" } };
  const ok = grade(q, b.data);
  await saveOutcome(learner, [found.category, q.technique].filter(Boolean), ok);
  if (b.data.last) {
    await migrate();
    await db().execute({ sql: "INSERT INTO events (learner_id, kind, key, ok, detail, at) VALUES (?, 'lesson_done', ?, 1, ?, ?)",
      args: [learner, found.category, b.data.lessonId, Date.now()] });
  }
  return { status: 200, body: { ok, answer_index: q.answer_index, flags: q.flags ?? [] } };
}
