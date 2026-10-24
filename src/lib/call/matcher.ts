import type { Intent } from "./types";

// Order matters: safety exits first, then refusals before questions before assent.
const RULES: [Intent, RegExp][] = [
  ["is_real", /\b(is (this|that) (real|a scam|genuine|practice)|are you (real|a scammer|a bot)|this is a scam|you'?re a scammer)\b/i],
  ["distress", /\b(scared|frightened|afraid|upset|panick?ing|crying)\b/i],
  ["hang_up", /\b(hang(ing)? up|goodbye|bye|end (the|this) call|put the phone down)\b/i],
  ["refuse", /\b(no|nope|no thanks|not (giving|sharing|telling|doing)|won'?t|will not|i'?ll call|call (my bank|the bank|you back|them)|not comfortable|i'?ll check)\b/i],
  ["question_identity", /\b(who|which|what'?s your|your name|prove|how do i know|staff (number|id)|why do you need|where are you calling)\b/i],
  ["stall", /\b(wait|hold on|hang on|one (sec|second|moment)|let me (think|check)|not sure|um+|hmm+)\b/i],
  ["comply", /\b(yes|yeah|yep|ok(ay)?|sure|alright|fine|go ahead|done|did|didn'?t|i have|got it|right|what do i (do|need))\b/i],
];

export function matchIntent(text: string): Intent | null {
  return RULES.find(([, re]) => re.test(text))?.[0] ?? null;
}
