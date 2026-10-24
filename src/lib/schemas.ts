import { z } from "zod";
import { CATEGORIES, TECHNIQUES } from "./taxonomy";

export const Brief = z.object({
  category: z.enum(CATEGORIES),
  technique: z.enum(TECHNIQUES),
  title: z.string().min(3),
  what_it_asks_for: z.string(),
  warning_signs: z.array(z.string()).min(2).max(5),
  safe_action: z.string(),
  source_url: z.string().url(),
  source_name: z.string(),
  published_at: z.string(),
});
export type Brief = z.infer<typeof Brief>;

export const Question = z
  .object({
    kind: z.enum(["mc", "real_or_scam", "red_flags"]),
    prompt: z.string(),
    message: z.object({ from: z.string(), text: z.string() }).optional(),
    options: z.array(z.string()).optional(),
    answer_index: z.number().int().optional(),
    flags: z.array(z.object({ span: z.string(), why: z.string() })).optional(),
    technique: z.enum(TECHNIQUES),
    explain: z.string(),
    safe_action: z.string(),
  })
  .superRefine((q, ctx) => {
    const bad = (message: string) => ctx.addIssue({ code: "custom", message });
    if (q.kind === "mc") {
      const n = q.options?.length ?? 0;
      if (n < 2 || n > 4) bad("mc needs 2-4 options");
      if (q.answer_index === undefined || q.answer_index < 0 || q.answer_index >= n) bad("mc answer_index out of range");
    }
    if (q.kind === "real_or_scam" && q.answer_index !== 0 && q.answer_index !== 1) bad("real_or_scam answer_index is 0 or 1");
    if (q.kind === "red_flags") {
      if (!q.message) bad("red_flags needs a message");
      else if (!q.flags?.length) bad("red_flags needs flags");
      else if (q.flags.some((f) => !q.message!.text.includes(f.span))) bad("every flag span must be in the message text");
    }
  });
export type Question = z.infer<typeof Question>;

export const Lesson = z.object({
  title: z.string(),
  cards: z.array(z.object({ heading: z.string(), body: z.string() })).min(3).max(5),
  quiz: z.array(Question).min(3).max(5),
});
export type Lesson = z.infer<typeof Lesson>;
