// Twilio webhook for each turn of a real practice call. Every request must carry a valid
// X-Twilio-Signature; only masked text ever reaches the coach.
import { startCall } from "@/lib/call/engine";
import { SCENARIOS } from "@/lib/call/scenarios";
import { firstTurn, nextTurn, validTwilio } from "@/lib/phone";
import { PUBLIC_URL } from "@/lib/practice";
import { saveOutcome } from "@/lib/profile";
import { coachMove } from "@/lib/tasks/coach";

const xml = (body: string) => new Response(body, { headers: { "content-type": "text/xml" } });

export async function POST(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(new URLSearchParams(await req.text())) as Record<string, string>;
  const signed = `${PUBLIC_URL()}${url.pathname}${url.search}`;
  if (!validTwilio(process.env.TWILIO_AUTH_TOKEN ?? "", signed, params, req.headers.get("x-twilio-signature"))) {
    console.error("phone twiml: bad signature", { signed, hasSig: Boolean(req.headers.get("x-twilio-signature")), keys: Object.keys(params).length });
    return new Response("forbidden", { status: 403 });
  }

  const sc = SCENARIOS[url.searchParams.get("s") ?? ""];
  const learner = url.searchParams.get("l") ?? "";
  if (!sc || !learner) return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`);
  const base = PUBLIC_URL();
  if (url.searchParams.get("start")) return xml(firstTurn(base, sc, learner));

  const node = url.searchParams.get("node") ?? sc.start;
  const speech = params.SpeechResult ?? "";
  let turn = nextTurn(base, sc, node, learner, speech);
  if (turn.needCoach) {
    const move = await coachMove({ ...startCall(sc), node }, sc, turn.masked, `phone-${params.CallSid ?? learner}`);
    turn = nextTurn(base, sc, node, learner, speech, move?.intent ?? "stall");
  }
  if (turn.end) {
    const tricks = [...new Set(Object.values(sc.nodes).map((n) => n.technique))].slice(0, 2);
    await saveOutcome(learner, [sc.category, ...tricks], turn.end === "pass", "phone").catch(() => undefined);
  }
  return xml(turn.twiml);
}
