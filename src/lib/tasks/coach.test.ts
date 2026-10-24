import { beforeAll, expect, test } from "vitest";
import { startCall } from "../call/engine";
import { SCENARIOS } from "../call/scenarios";
import { migrate } from "../db";
import type { Complete } from "../llm";
import { coachMove, gateCheck } from "./coach";

beforeAll(() => migrate());
const fake = (o: unknown): Complete => async () => ({ requestId: null,
  stream: (async function* () { yield { choices: [{ delta: { content: JSON.stringify(o) } }] }; })() });
const sc = SCENARIOS["safe-account"];

test("coach intent comes back", async () => {
  expect(await coachMove(startCall(sc), sc, "I made a cake", "t", "plain", fake({ intent: "stall" }))).toEqual({ intent: "stall", say: undefined });
});

test("coach line naming a real brand is dropped", async () => {
  const r = await coachMove(startCall(sc), sc, "x", "t", "plain", fake({ intent: "comply", say: "This is Barclays." }));
  expect(r).toEqual({ intent: "comply", say: undefined });
});

test("bad coach output is null", async () => {
  expect(await coachMove(startCall(sc), sc, "x", "t", "plain", fake({ intent: "dance" }))).toBeNull();
});

test("gatecheck flags sensitive replies", async () => {
  expect(await gateCheck("it's my dog's name, rover", "password", "t", fake({ sensitive: true }))).toEqual({ sensitive: true });
});

test("intent label comes back alone; bad labels are null", async () => {
  const { labelIntent } = await import("./coach");
  expect(await labelIntent("Did you make that payment?", "who is this?", "t", fake({ intent: "question_identity" }))).toBe("question_identity");
  expect(await labelIntent("x", "y", "t", fake({ intent: "dance" }))).toBeNull();
});
