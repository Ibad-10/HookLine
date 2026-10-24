// Varied off-script call turns for the Coach tasks, so Mubit has enough distinct
// examples to train an adapter. Run: npx tsx --env-file=.env scripts/coach-traffic.mts 120
import { startCall } from "../src/lib/call/engine.ts";
import { SCENARIOS } from "../src/lib/call/scenarios.ts";
import type { Arm } from "../src/lib/llm.ts";
import { coachMove } from "../src/lib/tasks/coach.ts";

const openers = ["Sorry,", "Hang on,", "Look,", "Erm,", "Right,", "Honestly,", "Oh dear,", "Well,", "Okay so", "Hmm,"];
const middles = [
  "my grandson usually deals with this stuff",
  "I'm driving at the moment",
  "the kettle's just boiled",
  "I thought my bank never phones",
  "can you send it in a letter instead",
  "I don't do online banking",
  "my wife handles the money",
  "I've got a doctor's appointment in ten minutes",
  "the line is really bad",
  "I'm at work, can this wait",
  "what was your name again",
  "I already had a call like this last week",
  "I'm not wearing my glasses",
  "my phone battery is about to die",
  "I need to ask my daughter first",
  "this sounds a bit odd to me",
  "I've never ordered a parcel from you",
  "can I ring the number on my card",
  "I don't understand what you need",
  "why is it so urgent",
  "I'll pop into the branch tomorrow",
  "how did you get this number",
  "I'm a bit hard of hearing, say that again",
  "my neighbour got scammed like this",
];
const closers = ["", " to be honest.", ", sorry.", ", okay?", ". Is that alright?", " if that's fine.", "."];

const n = Number(process.argv[2] ?? 120);
const scenarios = Object.values(SCENARIOS);
let ok = 0;
const one = async (i: number) => {
  const sc = scenarios[i % scenarios.length];
  const nodes = Object.keys(sc.nodes).filter((k) => !sc.nodes[k].end);
  const state = { ...startCall(sc), node: nodes[i % nodes.length] };
  const text = `${openers[i % openers.length]} ${middles[(i * 7) % middles.length]}${closers[(i * 3) % closers.length]}`;
  const arm: Arm = i % 2 ? "small" : "plain";
  const r = await coachMove(state, sc, text, `coach-traffic-${i}`, arm);
  if (r) ok++;
};
for (let i = 0; i < n; i += 3) await Promise.all([i, i + 1, i + 2].filter((j) => j < n).map(one));
console.log(`coach calls: ${ok}/${n} answered`);
