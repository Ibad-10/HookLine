import { expect, test } from "vitest";
import { Lesson } from "./schemas";

const q = {
  kind: "red_flags", prompt: "Tap the red flags", technique: "urgency", explain: "e", safe_action: "s",
  message: { from: "SwiftParcel", text: "Pay £1.99 within 1 hour or your parcel is returned: swiftparcel-fee.top" },
  flags: [{ span: "within 1 hour", why: "rushing you" }],
};
const lesson = {
  title: "t",
  cards: [1, 2, 3].map((i) => ({ heading: `h${i}`, body: "b" })),
  quiz: [q, { ...q }, { kind: "mc", prompt: "p", options: ["a", "b"], answer_index: 1, technique: "fear", explain: "e", safe_action: "s" }],
};

test("valid lesson passes", () => {
  expect(Lesson.safeParse(lesson).success).toBe(true);
});

test("flag span not in the message fails", () => {
  const bad = { ...lesson, quiz: [{ ...q, flags: [{ span: "not there", why: "x" }] }, q, q] };
  expect(Lesson.safeParse(bad).success).toBe(false);
});

test("mc answer out of range fails", () => {
  const bad = { ...lesson, quiz: [q, q, { ...lesson.quiz[2], answer_index: 5 }] };
  expect(Lesson.safeParse(bad).success).toBe(false);
});

test("flag spans that differ only in case or edge punctuation are repaired", async () => {
  const { repairLesson } = await import("./schemas");
  const loose = { ...lesson, quiz: [{ ...q, flags: [{ span: "Within 1 hour.", why: "rush" }, { span: "made up", why: "x" }] }, q, q] };
  const fixed = repairLesson(loose) as { quiz: { flags?: unknown }[] };
  expect(fixed.quiz[0].flags).toEqual([{ span: "within 1 hour", why: "rush" }]);
  expect(Lesson.safeParse(fixed).success).toBe(true);
});
