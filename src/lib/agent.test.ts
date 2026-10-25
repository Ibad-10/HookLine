import { expect, test } from "vitest";
import { agentPrompt, mask, nativePrompt, safetyExit } from "./agent";
import { SCENARIOS } from "./call/scenarios";

test("reading out digits stops the call before any model sees them", () => {
  expect(safetyExit("yeah it's four eight two nine one three")?.kind).toBe("stopped");
  expect(safetyExit("it's rover", "What's your password?")?.kind).toBe("stopped");
  expect(mask("it's 4829 13")).not.toMatch(/\d{3}/);
});

test("the learner can always leave", () => {
  expect(safetyExit("is this a scam?")?.kind).toBe("pass");
  expect(safetyExit("I'm going to hang up now")?.kind).toBe("pass");
  expect(safetyExit("hello, how are you?")).toBeNull();
});

test("the caller's brief comes from the scenario and keeps the rules", () => {
  const p = agentPrompt(SCENARIOS["safe-account"]);
  expect(p).toContain("Daniel, Northgate Bank");
  expect(p).toContain("one-time code");
  expect(p).toContain("END_SAFE:");
  expect(p).toContain("Never say this is practice");
});

test("sounds and greetings never stop the call, even right after an ask", () => {
  for (const said of ["ah", "uh-huh", "hello", "hmm", "sorry?"]) {
    expect(safetyExit(said)).toBeNull();
    expect(safetyExit(said, "Can you read the code out to me?")).toBeNull();
  }
  expect(safetyExit("I'd rather tell you about my day")).toBeNull();
});

test("any four digits stop the live call, however the caller asked", () => {
  expect(safetyExit("okay it's 4829", "And the last four digits on the front, please?")?.kind).toBe("stopped");
  expect(safetyExit("four eight two nine", "What number do you use at the cash machine?")?.kind).toBe("stopped");
  expect(safetyExit("I was born in nineteen", "Where are you from?")).toBeNull();
});

test("the ElevenLabs-run call carries the safety rules in its instructions", () => {
  const p = nativePrompt(SCENARIOS["safe-account"]);
  expect(p).toContain("end_call");
  expect(p).toContain("We stopped the call there");
  expect(p).toContain("not a real one");
  expect(p).not.toContain("END_SAFE");
});
