// Which practice call to suggest next, from the learner's weak spots; and a check that a call
// script is a complete graph (used for hand-written and generated scripts alike).
import { checkBrands } from "../brands";
import { type Pick, type Skill, weakness } from "../profile";
import type { Scenario } from "./types";

const ASKS = [null, "card", "code", "bank", "password", "money"];
const BRANCHES = ["comply", "question_identity", "refuse", "stall"] as const;

export function checkScenario(sc: Scenario): string[] {
  const bad: string[] = [];
  const n = sc.nodes;
  if (!n[sc.start]) bad.push("start missing");
  for (const id of ["truth", "end_safe", "end_scammed"]) if (!n[id]?.end) bad.push(`${id} missing`);
  if (!checkBrands(`${sc.brand} ${sc.caller} ${sc.title}`).ok) bad.push("real brand in names");
  for (const [id, node] of Object.entries(n)) {
    if (!ASKS.includes(node.ask)) bad.push(`${id}: bad ask`);
    if (!node.line || node.line.length > 280) bad.push(`${id}: line empty or too long`);
    if (!checkBrands(node.line).ok) bad.push(`${id}: real brand`);
    if (node.end) continue;
    for (const b of BRANCHES) if (!n[node.branches[b] ?? ""]) bad.push(`${id}: ${b} goes nowhere`);
  }
  return bad;
}

// A call's skills: its scam type plus the tricks its caller uses.
export const keysOf = (sc: Scenario) => [sc.category, ...new Set(Object.values(sc.nodes).map((x) => x.technique))];

// Ranks calls by the weakest skill they practise; unseen skills count as half-known.
export function suggestCalls(scs: Scenario[], skills: Skill[]): { sc: Scenario; pick: Pick }[] {
  const by = new Map(skills.map((s) => [s.key, s]));
  const score = (k: string) => { const s = by.get(k); return s ? weakness(s) : 0.5; };
  return scs
    .map((sc) => {
      // The scam type counts double: it decides which call you face.
      const key = [sc.category, ...keysOf(sc)].reduce((a, b) => (score(b) > score(a) ? b : a));
      const s = by.get(sc.category);
      const w = score(sc.category) * 2 + Math.max(...keysOf(sc).map(score));
      const reason: Pick["reason"] = score(key) > 0.5 ? "weak" : s && s.seen ? "due" : "known";
      return { sc, pick: { key, reason }, w };
    })
    .sort((a, b) => b.w - a.w)
    .map(({ sc, pick }) => ({ sc, pick }));
}
