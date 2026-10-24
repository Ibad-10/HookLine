// Twilio webhook for each turn of a real practice call. Every request must carry a valid
// X-Twilio-Signature or our own call token; only masked text ever reaches the coach.
import { startCall } from "@/lib/call/engine";
import { getScenario } from "@/lib/call/getScenario";
import { firstTurn, nextTurn, validToken, validTwilio } from "@/lib/phone";
import { contactPrefs, PUBLIC_URL } from "@/lib/practice";
import { saveOutcome } from "@/lib/profile";
import { talkMove } from "@/lib/tasks/coach";

const xml = (body: string) => new Response(body, { headers: { "content-type": "text/xml" } });

// At the "read me the code" step, a real code really arrives by text (Twilio Verify, to the
// learner's own confirmed number), so the moment feels like the real thing.
async function sendRealCode(learner: string) {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_VERIFY_SID: svc } = process.env;
  const prefs = await contactPrefs(learner);
  if (!svc || !prefs.phone.verified || !prefs.phone.number) return;
  await fetch(`https://verify.twilio.com/v2/Services/${svc}/Verifications`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: prefs.phone.number, Channel: "sms" }),
  }).catch(() => undefined);
}

export async function POST(req: Request) {
  const t0 = Date.now();
  const url = new URL(req.url);
  const params = Object.fromEntries(new URLSearchParams(await req.text())) as Record<string, string>;
  const signed = `${PUBLIC_URL()}${url.pathname}${url.search}`;
  const sp = url.searchParams;
  const ok = validTwilio(process.env.TWILIO_AUTH_TOKEN ?? "", signed, params, req.headers.get("x-twilio-signature"))
    || validToken(sp.get("s") ?? "", sp.get("l") ?? "", sp.get("t"));
  if (!ok) {
    console.error("phone twiml: refused", { hasSig: Boolean(req.headers.get("x-twilio-signature")), hasToken: Boolean(sp.get("t")) });
    return new Response("forbidden", { status: 403 });
  }

  const sc = await getScenario(sp.get("s") ?? "");
  const learner = sp.get("l") ?? "";
  if (!sc || !learner) return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`);
  const base = PUBLIC_URL();
  if (sp.get("start")) return xml(firstTurn(base, sc, learner));

  const node = sp.get("node") ?? sc.start;
  const quiet = Number(sp.get("q") ?? 0);
  const speech = params.SpeechResult ?? "";
  const answers = Number(sp.get("a") ?? 0);
  let turn = nextTurn(base, sc, node, learner, speech, undefined, quiet, answers);
  if (turn.needCoach) {
    const move = await talkMove({ ...startCall(sc), node }, sc, turn.masked, `phone-${params.CallSid ?? learner}`);
    turn = nextTurn(base, sc, node, learner, speech, move ?? { intent: "stall" }, quiet, answers);
  }
  if (!turn.end && turn.node !== node && sc.nodes[turn.node]?.ask === "code") await sendRealCode(learner);
  if (turn.end) {
    const tricks = [...new Set(Object.values(sc.nodes).map((n) => n.technique))].slice(0, 2);
    await saveOutcome(learner, [sc.category, ...tricks], turn.end === "pass", "phone").catch(() => undefined);
  }
  console.log("phone turn", { s: sc.id, from: node, to: turn.node, heard: turn.masked.length, conf: params.Confidence, end: turn.end, ms: Date.now() - t0 });
  return xml(turn.twiml);
}
