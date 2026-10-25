import { beforeAll, expect, test } from "vitest";
import { migrate } from "../db";
import type { Complete } from "../llm";
import seedBriefs from "../../data/seed-briefs.json";
import { writeEmail } from "./mailer";

beforeAll(() => migrate());
const fake = (o: unknown): Complete => async () => ({ requestId: null,
  stream: (async function* () { yield { choices: [{ delta: { content: JSON.stringify(o) } }] }; })() });
const brief = Object.values(seedBriefs)[0] as never;
const good = {
  brand: "Brightwell Energy", subject: "Refund waiting: confirm today",
  paragraphs: ["You are owed a refund of £86.20.", "Claim it within 24 hours or it will be cancelled."],
  button: "Claim refund", flags: [{ span: "within 24 hours", why: "Rushes you." }, { span: "owed a refund", why: "Unexpected money is bait." }],
};

test("a clean practice email comes back", async () => {
  expect(await writeEmail(brief, [], "t", fake(good))).toEqual(good);
});

test("emails naming a real brand, carrying a link or with made-up flags are refused", async () => {
  expect((await writeEmail(brief, [], "t", fake({ ...good, brand: "HSBC" })))?.brand).not.toBe("HSBC"); // rewritten, never sent
  expect(await writeEmail(brief, [], "t", fake({ ...good, paragraphs: ["Go to www.claim-now.co.uk", "Today."] }))).toBeNull();
  expect(await writeEmail(brief, [], "t", fake({ ...good, flags: [{ span: "not in it", why: "x" }] }))).toBeNull();
  const snapped = await writeEmail(brief, [], "t", fake({ ...good, flags: [{ span: "Within 24 hours.", why: "x" }, { span: "nope", why: "y" }] }));
  expect(snapped?.flags).toEqual([{ span: "within 24 hours", why: "x" }]);
});
