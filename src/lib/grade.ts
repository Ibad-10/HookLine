// Answers are graded in code against the answer key. A model never grades.
import type { Question } from "./schemas";

export type Answer = { choice?: number; spans?: string[] };

export function grade(q: Question, a: Answer): boolean {
  if (q.kind !== "red_flags") return a.choice === q.answer_index;
  const flags = q.flags?.map((f) => f.span) ?? [];
  const taps = a.spans ?? [];
  const hits = taps.filter((t) => flags.includes(t)).length;
  return hits >= Math.ceil(flags.length / 2) && taps.length - hits <= 1;
}
