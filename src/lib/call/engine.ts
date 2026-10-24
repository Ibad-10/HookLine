// Practice-call state machine. Pure, so it runs in the browser: the Gatekeeper
// sees every user turn before anything leaves the device.
import { gate } from "../gatekeeper";
import { matchIntent } from "./matcher";
import type { CallState, Intent, Scenario } from "./types";

export function startCall(sc: Scenario): CallState {
  return {
    scenarioId: sc.id,
    node: sc.start,
    step: 0,
    transcript: [{ who: "caller", text: sc.nodes[sc.start].line, node: sc.start }],
    outcome: null,
    checkpoints: [],
  };
}

const CHECKPOINT: Partial<Record<Intent, string>> = {
  refuse: "refused",
  question_identity: "asked_identity",
  hang_up: "hung_up",
  is_real: "asked_if_real",
  distress: "said_upset",
};

function goTo(s: CallState, sc: Scenario, node: string): CallState {
  const n = sc.nodes[node];
  const outcome = n.end === "safe" ? "pass" : n.end === "scammed" ? "scammed" : null;
  return { ...s, node, step: s.step + 1, outcome, transcript: [...s.transcript, { who: "caller", text: n.line, node }] };
}

export function applyIntent(s: CallState, sc: Scenario, intent: Intent): CallState {
  const cp = CHECKPOINT[intent];
  const marked = cp ? { ...s, checkpoints: [...s.checkpoints, cp] } : s;
  if (intent === "hang_up") return { ...marked, outcome: "pass" };
  if (intent === "is_real" || intent === "distress") return goTo(marked, sc, "truth");
  const next = sc.nodes[s.node].branches[intent];
  return next ? goTo(marked, sc, next) : marked;
}

export function step(
  s: CallState,
  sc: Scenario,
  userText: string,
  _input: "voice" | "typed",
): { state: CallState; needCoach: boolean; masked: string } {
  const g = gate(userText, sc.nodes[s.node].ask);
  const withTurn = { ...s, transcript: [...s.transcript, { who: "you" as const, text: g.masked }] };
  if (g.stop) return { state: { ...withTurn, outcome: "stopped", checkpoints: [...s.checkpoints, "gave_secret"] }, needCoach: false, masked: g.masked };
  const intent = matchIntent(userText);
  if (!intent) return { state: withTurn, needCoach: true, masked: g.masked };
  return { state: applyIntent(withTurn, sc, intent), needCoach: false, masked: g.masked };
}
