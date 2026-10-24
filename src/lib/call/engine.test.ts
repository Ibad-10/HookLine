import { expect, test } from "vitest";
import { applyIntent, startCall, step } from "./engine";
import { matchIntent } from "./matcher";
import { SCENARIOS } from "./scenarios";
import { TECHNIQUES } from "../taxonomy";

const sc = SCENARIOS["safe-account"];
const at = (node: string) => ({ ...startCall(sc), node });

test("reading out a code on the code step stops the call and keeps no digits", () => {
  const r = step(at("verify"), sc, "my code is 4 8 2 9 1 3", "voice");
  expect(r.state.outcome).toBe("stopped");
  expect(r.state.checkpoints).toContain("gave_secret");
  expect(JSON.stringify(r.state.transcript)).not.toMatch(/\d{3}/);
});

test("asking if it's real ends the call as a pass with the truth line", () => {
  const r = step(startCall(sc), sc, "hang on, is this real?", "voice");
  expect(r.state.outcome).toBe("pass");
  expect(r.state.node).toBe("truth");
});

test("distress ends kindly as a pass", () => {
  expect(step(startCall(sc), sc, "I'm scared", "voice").state.outcome).toBe("pass");
});

test("hanging up is a pass", () => {
  const r = step(startCall(sc), sc, "I'm going to hang up now", "voice");
  expect(r.state.outcome).toBe("pass");
  expect(r.state.checkpoints).toContain("hung_up");
});

test("questioning the caller follows the identity branch", () => {
  const r = step(startCall(sc), sc, "who is this exactly?", "voice");
  expect(r.state.node).toBe("identity");
  expect(r.state.checkpoints).toContain("asked_identity");
});

test("off-script talk asks for the coach", () => {
  const r = step(startCall(sc), sc, "the weather is lovely today", "voice");
  expect(r.needCoach).toBe(true);
  expect(r.state.node).toBe("open");
});

test("typed input behaves the same as voice", () => {
  expect(step(startCall(sc), sc, "who is this exactly?", "typed").state.node).toBe("identity");
});

test("complying all the way ends as scammed", () => {
  let s = at("secrecy");
  s = step(s, sc, "okay, done", "voice").state;
  expect(s.outcome).toBe("scammed");
});

test("applyIntent follows a coach decision", () => {
  expect(applyIntent(startCall(sc), sc, "comply").node).toBe("verify");
});

test("matcher basics", () => {
  expect(matchIntent("no thanks, I'll call my bank myself")).toBe("refuse");
  expect(matchIntent("yes")).toBe("comply");
  expect(matchIntent("bananas")).toBeNull();
});

test("scenarios are well formed", () => {
  for (const s of Object.values(SCENARIOS)) {
    expect(s.nodes[s.start]).toBeDefined();
    expect(s.nodes.truth?.end).toBe("safe");
    for (const [id, n] of Object.entries(s.nodes)) {
      expect(TECHNIQUES as readonly string[]).toContain(n.technique);
      for (const next of Object.values(n.branches)) expect(s.nodes[next!], `${s.id}.${id} -> ${next}`).toBeDefined();
    }
  }
});

test("C1: distress or goodbye on a step asking for a code ends kindly as a pass", () => {
  expect(step(at("verify"), sc, "I'm scared", "voice").state.outcome).toBe("pass");
  expect(step(at("verify"), sc, "ok bye", "voice").state.outcome).toBe("pass");
  expect(step(at("verify"), sc, "I'm scared, it's 4829", "voice").state.outcome).toBe("stopped");
});
