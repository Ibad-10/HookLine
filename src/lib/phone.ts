// Real practice call over Twilio (design doc section 16). Same scenarios, engine and
// Gatekeeper as the browser call; the server builds TwiML for each turn.
import { createHmac, timingSafeEqual } from "node:crypto";
import { applyIntent, startCall } from "./call/engine";
import { matchIntent } from "./call/matcher";
import type { Intent, Scenario } from "./call/types";
import { gate, normalizeSpoken } from "./gatekeeper";
import { NARRATION } from "./voices";

// Twilio signs each webhook: base64(HMAC-SHA1(authToken, url + sorted key+value pairs)).
export function twilioSignature(authToken: string, url: string, params: Record<string, string>): string {
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join("");
  return createHmac("sha1", authToken).update(data).digest("base64");
}

export function validTwilio(authToken: string, url: string, params: Record<string, string>, signature: string | null): boolean {
  if (!authToken || !signature) return false;
  const want = Buffer.from(twilioSignature(authToken, url, params));
  const got = Buffer.from(signature);
  return want.length === got.length && timingSafeEqual(want, got);
}

// Twilio's trial numbers forward webhooks without a signature, so each call URL also carries
// our own token, an HMAC of scenario and learner keyed by the Twilio auth token.
export function callToken(scenario: string, learner: string, secret = process.env.TWILIO_AUTH_TOKEN ?? ""): string {
  return createHmac("sha256", secret).update(`${scenario}:${learner}`).digest("base64url").slice(0, 32);
}

export function validToken(scenario: string, learner: string, token: string | null): boolean {
  if (!token || !process.env.TWILIO_AUTH_TOKEN) return false;
  const want = Buffer.from(callToken(scenario, learner));
  const got = Buffer.from(token);
  return want.length === got.length && timingSafeEqual(want, got);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type Turn = { twiml: string; end: null | "pass" | "stopped" | "scammed"; node: string; masked: string; needCoach?: boolean };
type Narration = keyof typeof NARRATION;

const xml = (body: string) => `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;
const play = (url: string) => `<Play>${esc(url)}</Play>`;
const narrate = (base: string, k: Narration) => play(`${base}/audio/hookline/${k}.mp3`);
export const auth = (sc: Scenario, learner: string) => `s=${sc.id}&l=${learner}&t=${callToken(sc.id, learner)}`;

// Recorded clip for hand-written calls; made on the fly (same voice) for written-for-you calls.
export function lineUrl(base: string, sc: Scenario, node: string, learner: string): string {
  return sc.generated ? `${base}/api/phone/audio?${auth(sc, learner)}&node=${node}` : `${base}/audio/${sc.id}/${node}.mp3`;
}
export const sayUrl = (base: string, sc: Scenario, learner: string, text: string) =>
  `${base}/api/phone/audio?${auth(sc, learner)}&say=${encodeURIComponent(text)}`;

// Listen while the caller talks (barge-in), and always come back to us, even on silence.
function gather(base: string, sc: Scenario, node: string, learner: string, before: string, plays: string[], quiet = 0, answers = 0): string {
  const action = esc(`${base}/api/phone/twiml?${auth(sc, learner)}&node=${node}&q=${quiet}&a=${answers}`);
  const hints = esc(["yes", "no", "who is this", "is this real", "hang up", ...sc.keyterms].join(", "));
  return xml(`${before}<Gather input="speech" action="${action}" method="POST" speechTimeout="auto" timeout="6" actionOnEmptyResult="true" speechModel="phone_call" enhanced="true" language="en-GB" hints="${hints}">${plays.map(play).join("")}</Gather>`);
}

function finish(base: string, k: Narration, callerUrl?: string): string {
  return xml(`${callerUrl ? play(callerUrl) : ""}<Pause length="1"/>${narrate(base, k)}<Hangup/>`);
}

export function firstTurn(base: string, sc: Scenario, learner: string): string {
  // No opening notice: the learner asked for this call and confirmed their number; the call
  // opens like a real one. Hookline speaks at the end, or the moment they ask "is this real?".
  return gather(base, sc, sc.start, learner, "", [lineUrl(base, sc, sc.start, learner)]);
}

const FAST: Intent[] = ["hang_up", "is_real", "distress"];

// One caller reply. Only the safety exits are decided here; everything else goes to the live
// caller (needCoach), who answers what was said. Questions and small talk keep the call on this
// step up to twice; silence gets one "hello?" then ends.
export function nextTurn(base: string, sc: Scenario, node: string, learner: string, speech: string, coach?: { intent: Intent; say?: string }, quiet = 0, answers = 0): Turn {
  if (!speech.trim()) {
    if (quiet >= 1) return { twiml: finish(base, "quiet"), end: "pass", node, masked: "" };
    return { twiml: gather(base, sc, node, learner, "", [sayUrl(base, sc, learner, "Hello? Are you still there?")], quiet + 1, answers), end: null, node, masked: "" };
  }
  const g = gate(speech, sc.nodes[node]?.ask ?? null);
  // Live replies can ask for numbers on any step, so 4+ digits in a row always stop the call.
  if (g.stop || /\d{4,}/.test(normalizeSpoken(speech))) return { twiml: finish(base, "stopped"), end: "stopped", node, masked: g.masked };
  const fast = matchIntent(speech);
  const intent = coach?.intent ?? (fast && FAST.includes(fast) ? fast : null);
  if (!intent) return { twiml: "", end: null, node, masked: g.masked, needCoach: true };
  if (intent === "hang_up") return { twiml: finish(base, "hung_up"), end: "pass", node, masked: g.masked };
  if ((intent === "stall" || intent === "question_identity") && coach?.say && answers < 2)
    return { twiml: gather(base, sc, node, learner, "", [sayUrl(base, sc, learner, coach.say)], 0, answers + 1), end: null, node, masked: g.masked };
  const s = applyIntent({ ...startCall(sc), node }, sc, intent);
  if (s.outcome === "pass") return { twiml: finish(base, "pass", lineUrl(base, sc, s.node, learner)), end: "pass", node: s.node, masked: g.masked };
  if (s.outcome === "scammed") return { twiml: finish(base, "scammed", lineUrl(base, sc, s.node, learner)), end: "scammed", node: s.node, masked: g.masked };
  // The live caller's own words carry the call on (they react to what was said); the recorded
  // line is the fallback.
  const next = coach?.say && (intent === "comply" || intent === "refuse") ? sayUrl(base, sc, learner, coach.say) : lineUrl(base, sc, s.node, learner);
  return { twiml: gather(base, sc, s.node, learner, "", [next]), end: null, node: s.node, masked: g.masked };
}
