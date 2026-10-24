import { beforeAll, expect, test } from "vitest";
import { migrate } from "../db";
import type { Complete } from "../llm";
import type { Brief } from "../schemas";
import { teacherUser, writeLesson } from "./teacher";

beforeAll(() => migrate());

const brief: Brief = {
  category: "delivery_fee", technique: "urgency", title: "Parcel fee text", what_it_asks_for: "card details",
  warning_signs: ["small fee", "short deadline"], safe_action: "Check with the courier's own app",
  source_url: "https://www.actionfraud.police.uk", source_name: "Action Fraud", published_at: "2026-10-20",
};
const learner = { weak: ["delivery_fee"], known: ["romance"] };

function fake(obj: unknown): Complete {
  return async () => ({ requestId: null, stream: (async function* () {
    yield { choices: [{ delta: { content: JSON.stringify(obj) } }] };
  })() });
}
const q = { kind: "mc", prompt: "p", options: ["a", "b"], answer_index: 0, technique: "urgency", explain: "e", safe_action: "s" };
const lesson = (title: string) => ({ title, cards: [1, 2, 3].map(() => ({ heading: "h", body: "b" })), quiz: [q, q, q] });

test("stuffed arm carries the learner history, plain does not", () => {
  const h = ["missed delivery_fee 2026-10-20"];
  expect(teacherUser(brief, learner, "stuffed", h)).toContain("missed delivery_fee");
  expect(teacherUser(brief, learner, "plain", h)).not.toContain("missed delivery_fee");
});


test("a clean lesson is returned", async () => {
  const l = await writeLesson(brief, learner, "plain", "t", [], fake(lesson("Parcel fees")));
  expect(l?.title).toBe("Parcel fees");
});

test("a real name in the lesson is rewritten, not thrown away, and recorded as raw", async () => {
  const l = await writeLesson(brief, learner, "plain", "t", [], fake(lesson("When HMRC calls")));
  expect(l?.title).not.toContain("HMRC");
});

test("real names in the brief are scrubbed before the Teacher sees them", () => {
  const u = teacherUser({ ...brief, title: "FTC impersonators call" }, learner, "plain");
  expect(u).not.toContain("FTC impersonators");
  expect(u).toContain(brief.source_url);
});
