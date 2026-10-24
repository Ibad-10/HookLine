// Twilio webhook for each turn of a real practice call. Every request must carry a valid
// X-Twilio-Signature or our own call token; only masked text ever reaches the coach.
import { startCall } from "@/lib/call/engine";
import { getScenario } from "@/lib/call/getScenario";
import type { Scenario } from "@/lib/call/types";
import { after } from "next/server";
import { randomUUID } from "node:crypto";
import type { Turn } from "@/lib/call/types";
import { db, migrate } from "@/lib/db";
import { auth, firstTurn, nextTurn, validToken, validTwilio, type Turn as PhoneTurn } from "@/lib/phone";
import { speech as speech_ } from "@/lib/voiceCache";
import { contactPrefs, PUBLIC_URL } from "@/lib/practice";
import { saveOutcome } from "@/lib/profile";
import { talkMove } from "@/lib/tasks/coach";

export const maxDuration = 60;

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

// Hands the call to the ElevenLabs voice agent (live listening and replies; its brain is
// /api/agent/llm). Returns null if ElevenLabs refuses.
async function agentTwiml(base: string, sc: Scenario, learner: string, params: Record<string, string>): Promise<string | null> {
  const res = await fetch("https://api.elevenlabs.io/v1/convai/twilio/register-call", {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "", "content-type": "application/json" },
    body: JSON.stringify({
      agent_id: process.env.ELEVENLABS_AGENT_ID,
      from_number: params.From ?? process.env.TWILIO_FROM_NUMBER,
      to_number: params.To ?? "",
      direction: "outbound",
      conversation_initiation_client_data: {
        conversation_config_override: { agent: { first_message: sc.nodes[sc.start].line }, tts: { voice_id: sc.voice } },
        custom_llm_extra_body: { scenario: sc.id, learner },
      },
    }),
  }).catch(() => null);
  if (!res?.ok) {
    console.error("phone: agent register failed", res?.status, res ? (await res.text()).slice(0, 300) : "");
    return null;
  }
  const twiml = await res.text();
  return twiml;
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
  if (sp.get("start")) {
    // Live agent needs Twilio Media Streams, which Twilio's shared trial numbers don't allow;
    // turn it on (PHONE_AGENT=on) once Hookline has its own Twilio number.
    const live = process.env.PHONE_AGENT === "on" && process.env.ELEVENLABS_AGENT_ID ? await agentTwiml(base, sc, learner, params) : null;
    if (live) {
      if ((sc.nodes.verify?.ask ?? null) === "code") sendRealCode(learner); // arrives as the caller asks for it
      return xml(live);
    }
    return xml(firstTurn(base, sc, learner)); // fallback: the scripted call
  }

  // Second half of a slow turn: wait (briefly) for the reply being written in the background.
  const wait = sp.get("wait");
  if (wait) {
    for (let i = 0; i < 45; i++) {
      const row = (await db().execute({ sql: "SELECT twiml FROM phone_pending WHERE id = ?", args: [wait] })).rows[0];
      if (row?.twiml) return xml(String(row.twiml));
      await new Promise((r) => setTimeout(r, 200));
    }
    console.error("phone turn: reply not ready", wait);
    return xml(nextTurn(base, sc, sp.get("node") ?? sc.start, learner, "", undefined, 0).twiml);
  }

  const node = sp.get("node") ?? sc.start;
  const quiet = Number(sp.get("q") ?? 0);
  const speech = params.SpeechResult ?? "";
  const answers = Number(sp.get("a") ?? 0);
  const sid = params.CallSid ?? learner;
  const fast = nextTurn(base, sc, node, learner, speech, undefined, quiet, answers);
  if (!fast.needCoach) {
    await finishTurn(sc, node, learner, sid, fast, "");
    return xml(fast.twiml);
  }

  // Slow turn: the caller says a quick "mm, right" while the live reply is written and voiced.
  await migrate();
  const id = randomUUID();
  await db().execute({ sql: "INSERT INTO phone_pending (id, twiml, at) VALUES (?, NULL, ?)", args: [id, Date.now()] });
  after(async () => {
    const history = await loadHistory(sid);
    const state = { ...startCall(sc), node, transcript: [...history, { who: "you" as const, text: fast.masked }] };
    const move = await talkMove(state, sc, fast.masked, `phone-${sid}`);
    const turn = nextTurn(base, sc, node, learner, speech, move ?? { intent: "stall" }, quiet, answers);
    if (move?.say && turn.twiml.includes("say=")) await speech_(sc.voice || "JBFqnCBsd6RMkjVDRZzb", move.say);
    await db().execute({ sql: "UPDATE phone_pending SET twiml = ? WHERE id = ?", args: [turn.twiml, id] });
    await finishTurn(sc, node, learner, sid, turn, move?.say ?? "");
    console.log("phone turn", { s: sc.id, from: node, to: turn.node, heard: turn.masked.length, conf: params.Confidence, end: turn.end, ms: Date.now() - t0 });
  });
  const filler = `${base}/audio/filler/${sc.voice || "JBFqnCBsd6RMkjVDRZzb"}/${Math.floor(Math.random() * 3)}.mp3`;
  const again = `${base}/api/phone/twiml?${auth(sc, learner)}&node=${node}&wait=${id}`.replace(/&/g, "&amp;");
  return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Play>${filler}</Play><Redirect method="POST">${again}</Redirect></Response>`);
}

// What was said so far on this call (masked), so the caller remembers.
async function loadHistory(sid: string): Promise<Turn[]> {
  await migrate();
  const row = (await db().execute({ sql: "SELECT history FROM phone_calls WHERE sid = ?", args: [sid] })).rows[0];
  return row ? (JSON.parse(String(row.history)) as Turn[]) : [];
}

async function finishTurn(sc: Scenario, node: string, learner: string, sid: string, turn: PhoneTurn, said: string) {
  const history = await loadHistory(sid);
  const next = [...history, { who: "you" as const, text: turn.masked }, { who: "caller" as const, text: said || sc.nodes[turn.node]?.line || "" }].slice(-12);
  await db().execute({ sql: "INSERT OR REPLACE INTO phone_calls (sid, history, at) VALUES (?, ?, ?)", args: [sid, JSON.stringify(next), Date.now()] });
  if (!turn.end && turn.node !== node && sc.nodes[turn.node]?.ask === "code") await sendRealCode(learner);
  if (turn.end) {
    const tricks = [...new Set(Object.values(sc.nodes).map((n) => n.technique))].slice(0, 2);
    await saveOutcome(learner, [sc.category, ...tricks], turn.end === "pass", "phone").catch(() => undefined);
  }
}
