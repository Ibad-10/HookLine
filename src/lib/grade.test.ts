import { expect, test } from "vitest";
import { grade } from "./grade";
import type { Question } from "./schemas";

const base = { prompt: "p", technique: "urgency", explain: "e", safe_action: "s" } as const;
const mc: Question = { ...base, kind: "mc", options: ["a", "b", "c"], answer_index: 2 };
const rf: Question = { ...base, kind: "red_flags", message: { from: "x", text: "Pay now or lose it at swift-fee.top" },
  flags: [{ span: "Pay now", why: "rush" }, { span: "swift-fee.top", why: "odd link" }] };

test("mc and real_or_scam graded by answer index in code", () => {
  expect(grade(mc, { choice: 2 })).toBe(true);
  expect(grade(mc, { choice: 0 })).toBe(false);
});

test("red flags: need at least half the flags and no more than one wrong tap", () => {
  expect(grade(rf, { spans: ["Pay now", "swift-fee.top"] })).toBe(true);
  expect(grade(rf, { spans: ["Pay now"] })).toBe(true);
  expect(grade(rf, { spans: [] })).toBe(false);
  expect(grade(rf, { spans: ["Pay now", "or", "lose"] })).toBe(false);
});
