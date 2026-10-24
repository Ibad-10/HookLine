// Varied live-caller turns, so Mubit has enough distinct examples to train an adapter for the
// "talker" task. Run: npx tsx --env-file=.env scripts/talker-traffic.mts 150
import { startCall } from "../src/lib/call/engine.ts";
import { SCENARIOS } from "../src/lib/call/scenarios.ts";
import { talkMove } from "../src/lib/tasks/coach.ts";

const replies = [
  "hello, how are you?", "who is this?", "what's your name again?", "where are you calling from?",
  "how did you get my number?", "sorry, I can't hear you very well", "is that really you, Daniel?",
  "I'm busy right now, can you call back later?", "what payment are you talking about?", "I didn't make any payment",
  "yes, that was me actually", "I'm not sure, let me check my app", "can you prove you're from the company?",
  "my son usually deals with this", "what do you need from me?", "why do you need that?", "okay, what do I do?",
  "I don't feel comfortable with this", "I'll ring the number on my card instead", "can you send me a letter?",
  "hang on, the doorbell's going", "oh no, is my money safe?", "how much did you say it was?", "right, go on then",
  "I've got the text here, it says •••", "I'm driving, make it quick", "my wife handles the bank stuff",
  "what's your staff number?", "which branch are you at?", "I've never heard of your company",
  "do I have to do it now?", "can I think about it?", "I don't have my glasses on", "you sound a bit odd",
  "fine, what's the next step?", "I already gave my details to someone yesterday", "is there a reference number?",
  "how long will this take?", "I'm at work, can we do this tonight?", "what happens if I don't?",
];
const n = Number(process.argv[2] ?? 150);
const scs = Object.values(SCENARIOS);
let ok = 0;
const one = async (i: number) => {
  const sc = scs[i % scs.length];
  const nodes = Object.keys(sc.nodes).filter((k) => !sc.nodes[k].end);
  const node = nodes[(i * 7) % nodes.length];
  const said = replies[(i * 11) % replies.length];
  const prior = replies[(i * 3 + 5) % replies.length];
  const s0 = startCall(sc);
  const state = { ...s0, node, transcript: i % 2 ? [...s0.transcript, { who: "you" as const, text: prior }, { who: "caller" as const, text: sc.nodes[node].line }] : s0.transcript };
  if (await talkMove(state, sc, said, `talker-traffic-${i}`)) ok++;
};
for (let i = 0; i < n; i += 3) await Promise.all([i, i + 1, i + 2].filter((j) => j < n).map(one));
console.log(`talker calls: ${ok}/${n} answered`);
