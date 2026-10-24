// Real practice call over Twilio (design doc section 16). Same scenarios, engine and
// Gatekeeper as the browser call; the server builds TwiML for each turn.
import { createHmac, timingSafeEqual } from "node:crypto";
import { applyIntent, startCall } from "./call/engine";
import { matchIntent } from "./call/matcher";
import type { Intent, Scenario } from "./call/types";
import { gate } from "./gatekeeper";

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

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const NOTICE = "This is a Hookline practice call. Nothing you say is kept. You can hang up at any time.";

export type Turn = { twiml: string; end: null | "pass" | "stopped" | "scammed"; node: string; masked: string; needCoach?: boolean };

function gather(base: string, sc: Scenario, node: string, learner: string, before = ""): string {
  const action = esc(`${base}/api/phone/twiml?s=${sc.id}&node=${node}&l=${learner}`);
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${before}<Gather input="speech" action="${action}" method="POST" speechTimeout="auto" language="en-GB"><Play>${esc(`${base}/audio/${sc.id}/${node}.mp3`)}</Play></Gather><Say voice="Polly.Amy">I didn't catch that. Goodbye.</Say><Hangup/></Response>`;
}

function finish(base: string, sc: Scenario, node: string | null, say: string): string {
  const play = node ? `<Play>${esc(`${base}/audio/${sc.id}/${node}.mp3`)}</Play>` : "";
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${play}<Say voice="Polly.Amy">${esc(say)}</Say><Hangup/></Response>`;
}

export function firstTurn(base: string, sc: Scenario, learner: string): string {
  return gather(base, sc, sc.start, learner, `<Say voice="Polly.Amy">${esc(NOTICE)}</Say><Pause length="1"/>`);
}

// One caller reply. Returns null intent work to the coach (off-script) via needCoach.
export function nextTurn(base: string, sc: Scenario, node: string, learner: string, speech: string, coachIntent?: Intent): Turn {
  const g = gate(speech, sc.nodes[node]?.ask ?? null);
  if (g.stop)
    return { twiml: finish(base, sc, null, "We've stopped the call there: it sounded like real details. This was a Hookline practice call. Open the app for your review."), end: "stopped", node, masked: g.masked };
  const intent = coachIntent ?? matchIntent(speech);
  if (!intent) return { twiml: "", end: null, node, masked: g.masked, needCoach: true };
  const s = applyIntent({ ...startCall(sc), node }, sc, intent);
  if (intent === "hang_up") return { twiml: finish(base, sc, null, "Well done. Hanging up is always right. This was a Hookline practice call."), end: "pass", node, masked: g.masked };
  if (s.outcome === "pass") return { twiml: finish(base, sc, s.node, "This was a Hookline practice call. Open the app for your review."), end: "pass", node: s.node, masked: g.masked };
  if (s.outcome === "scammed") return { twiml: finish(base, sc, s.node, "This was a Hookline practice call, and this one caught you. Open the app to see the tricks it used."), end: "scammed", node: s.node, masked: g.masked };
  return { twiml: gather(base, sc, s.node, learner), end: null, node: s.node, masked: g.masked };
}
