import { expect, test } from "vitest";
import { pickNext, record, weakness, whyText, type Skill } from "./profile";

const DAY = 86_400_000;
const sk = (key: string, correct: number, seen: number, box = 2, due_at = 0): Skill => ({ key, correct, seen, box, due_at });

test("correct answer moves up a box", () => {
  const s = record(sk("delivery_fee", 1, 1, 1), true, 0);
  expect(s.box).toBe(2);
  expect(s.due_at).toBe(7 * DAY);
  expect(s.seen).toBe(2);
});

test("wrong answer drops to box 1, due in 2 days", () => {
  const s = record(sk("delivery_fee", 3, 3, 3), false, 0);
  expect(s.box).toBe(1);
  expect(s.due_at).toBe(2 * DAY);
});

test("box caps at 4", () => {
  expect(record(sk("x", 9, 9, 4), true, 0).box).toBe(4);
});

test("weakness is higher for misses", () => {
  expect(weakness(sk("a", 0, 4))).toBeGreaterThan(weakness(sk("b", 4, 4)));
});

test("picker mixes about 1 weak to 2 known", () => {
  const skills = [sk("weak1", 0, 5), ...["k1", "k2", "k3", "k4", "k5"].map((k) => sk(k, 5, 5))];
  const picks = pickNext(skills, 0);
  expect(picks).toHaveLength(3);
  expect(picks.filter((p) => p.reason === "weak").map((p) => p.key)).toEqual(["weak1"]);
});

test("overdue skill is picked before one not yet due", () => {
  const skills = [sk("later", 5, 5, 3, 10 * DAY), sk("overdue", 5, 5, 3, 1 * DAY), sk("w", 0, 5)];
  const picks = pickNext(skills, 5 * DAY, 2).map((p) => p.key);
  expect(picks).toContain("overdue");
  expect(picks).not.toContain("later");
});

test("why text is kind", () => {
  const t = whyText({ key: "delivery_fee", reason: "weak" }, { key: "delivery_fee", at: Date.UTC(2026, 9, 20) });
  expect(t).toMatch(/parcel/i);
  expect(t).not.toMatch(/fail/i);
});

test("saveOutcome writes skills and events", async () => {
  const { loadSkills, saveOutcome } = await import("./profile");
  await saveOutcome("p1", ["delivery_fee", "urgency"], true, "quiz", 0);
  await saveOutcome("p1", ["delivery_fee"], false, "quiz", 0);
  const s = await loadSkills("p1");
  expect(s.find((x) => x.key === "delivery_fee")).toMatchObject({ seen: 2, correct: 1, box: 1 });
  expect(s.find((x) => x.key === "urgency")).toMatchObject({ box: 1, seen: 1 });
});
