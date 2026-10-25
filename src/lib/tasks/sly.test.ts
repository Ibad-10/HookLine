import { beforeAll, expect, test } from "vitest";
import { migrate } from "../db";
import type { Complete } from "../llm";
import { askSly } from "./sly";

beforeAll(() => migrate());
let seen = "";
const fake = (o: unknown): Complete => async (p) => {
  seen = p.user;
  return { requestId: null, stream: (async function* () { yield { choices: [{ delta: { content: JSON.stringify(o) } }] }; })() };
};

test("Sly answers with a verdict, and never sees the numbers that were pasted", async () => {
  const out = { verdict: "likely_scam", answer: "This looks like a scam.", flags: ["A rush to pay"], do: "Check in the courier's own app." };
  expect(await askSly("Pay £1.45 now, your code is 482913", "t", fake(out))).toEqual(out);
  expect(seen).not.toContain("482913");
});
