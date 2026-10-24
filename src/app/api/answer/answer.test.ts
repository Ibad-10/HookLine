import { expect, test, vi } from "vitest";
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
import { answer } from "./handler";
import { loadSkills } from "@/lib/profile";
import { seedLesson } from "@/lib/learner";

test("correct answer moves category and trick up; wrong drops to box 1", async () => {
  const q = seedLesson("delivery_fee").quiz.findIndex((x) => x.kind !== "red_flags");
  const item = seedLesson("delivery_fee").quiz[q];
  let r = await answer("a1", { lessonId: "seed:delivery_fee", q, choice: item.answer_index });
  expect(r.body).toMatchObject({ ok: true });
  let s = await loadSkills("a1");
  expect(s.find((x) => x.key === "delivery_fee")?.box).toBe(1);
  expect(s.find((x) => x.key === item.technique)?.box).toBe(1);
  r = await answer("a1", { lessonId: "seed:delivery_fee", q, choice: item.answer_index });
  expect((await loadSkills("a1")).find((x) => x.key === "delivery_fee")?.box).toBe(2);
  r = await answer("a1", { lessonId: "seed:delivery_fee", q, choice: (item.answer_index! + 1) % 2 });
  expect(r.body).toMatchObject({ ok: false });
  expect((await loadSkills("a1")).find((x) => x.key === "delivery_fee")?.box).toBe(1);
});

test("unknown lesson is a 404, junk is a 400", async () => {
  expect((await answer("a1", { lessonId: "seed:nope", q: 0, choice: 0 })).status).toBe(404);
  expect((await answer("a1", { nonsense: true })).status).toBe(400);
});
