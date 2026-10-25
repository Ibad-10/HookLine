// Confirms the learner owns their practice-call number with Twilio Verify (works on trial
// accounts), then marks it verified. "Call me now" only rings numbers confirmed here.
import { createHash, randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { NARRATOR } from "@/lib/voices";
import { requireLearner } from "@/lib/learner";
import { allow } from "@/lib/limits";
import { contactPrefs } from "@/lib/practice";

const twilio = (path: string, body: Record<string, string>) => {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token } = process.env;
  return fetch(`https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SID}/${path}`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
};

// Whether a code is waiting, and how long before another can be sent, so the page can lock
// the number and the button even after a reload. phone_codes only tracks timing; Twilio holds the code.
export async function GET() {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json({ pending: false, wait: 0 });
  const row = (await db().execute({ sql: "SELECT expires_at FROM phone_codes WHERE learner_id = ?", args: [id] })).rows[0];
  const left = row ? Number(row.expires_at) - Date.now() : 0;
  return Response.json({ pending: left > 0, wait: Math.max(0, Math.ceil((left - 9 * 60_000) / 1000)) });
}

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

// Rings the number from the ElevenLabs line and reads the code twice, then hangs up.
async function callWithCode(to: string, code: string): Promise<boolean> {
  const { ELEVENLABS_AGENT_ID: agent, ELEVENLABS_PHONE_NUMBER_ID: line } = process.env;
  if (!agent || !line) return false;
  const spoken = code.split("").join(", ");
  const r = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound-call", {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "", "content-type": "application/json" },
    body: JSON.stringify({
      agent_id: agent,
      agent_phone_number_id: line,
      to_number: to,
      conversation_initiation_client_data: {
        conversation_config_override: { agent: { first_message: `Hello, this is Hookline. Your code is ${spoken}. Again, ${spoken}. Goodbye.` }, tts: { voice_id: NARRATOR } },
        custom_llm_extra_body: { mode: "code" },
      },
    }),
  }).catch(() => null);
  const j = r?.ok ? ((await r.json().catch(() => ({}))) as { success?: boolean }) : null;
  return Boolean(r?.ok && j?.success !== false);
}

export async function POST(req: Request) {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!process.env.TWILIO_VERIFY_SID) return Response.json({ error: "Phone practice isn't set up yet." }, { status: 503 });
  const prefs = await contactPrefs(id);
  if (!prefs.phone.on || !prefs.phone.number) return Response.json({ error: "Save your number first." }, { status: 400 });
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };

  if (!code) {
    const last = (await db().execute({ sql: "SELECT expires_at FROM phone_codes WHERE learner_id = ?", args: [id] })).rows[0];
    if (last && Number(last.expires_at) - 9 * 60_000 > Date.now()) return Response.json({ error: "Wait a minute before asking for another code." }, { status: 429 });
    const res = await twilio("Verifications", { To: prefs.phone.number, Channel: "sms" });
    if (res.ok) {
      await db().execute({
        sql: "INSERT OR REPLACE INTO phone_codes (learner_id, number, hash, expires_at, tries) VALUES (?, ?, '', ?, 0)",
        args: [id, prefs.phone.number, Date.now() + 10 * 60_000],
      });
      return Response.json({ sent: true });
    }
    const j = await res.json().catch(() => ({}));
    console.error("phone verify: text failed, trying a voice code", res.status, j.code, j.message);
    // Text refused (e.g. a trial account's tester list): ring the number instead and read our
    // own code out, from the ElevenLabs line. Only the person holding that phone hears it.
    const fresh = String(randomInt(100000, 1000000));
    // Code calls ring a number nobody has confirmed yet: at most 3 a day per number and 20 a day overall.
    const okToRing = (await allow("code-call", prefs.phone.number, 3, 86_400_000)) && (await allow("code-call-all", "all", 20, 86_400_000));
    if (okToRing && (await callWithCode(prefs.phone.number, fresh))) {
      await db().execute({
        sql: "INSERT OR REPLACE INTO phone_codes (learner_id, number, hash, expires_at, tries) VALUES (?, ?, ?, ?, 0)",
        args: [id, prefs.phone.number, hash(fresh), Date.now() + 10 * 60_000],
      });
      return Response.json({ sent: true, by: "call" });
    }
    return Response.json({ error: `The code couldn't be sent: ${j.message ?? res.status}` }, { status: 502 });
  }

  const row = (await db().execute({ sql: "SELECT number, hash, expires_at, tries FROM phone_codes WHERE learner_id = ?", args: [id] })).rows[0];
  if (!row || Number(row.expires_at) < Date.now() || row.number !== prefs.phone.number || Number(row.tries) >= 5)
    return Response.json({ error: "That code has expired. Ask for a new one." }, { status: 400 });
  let right = false;
  if (row.hash) right = hash(code.trim()) === row.hash; // our own code, read out by call
  else {
    const res = await twilio("VerificationCheck", { To: prefs.phone.number, Code: code.trim() });
    const j = await res.json().catch(() => ({}));
    right = res.ok && j.status === "approved";
  }
  if (!right) {
    await db().execute({ sql: "UPDATE phone_codes SET tries = tries + 1 WHERE learner_id = ?", args: [id] });
    return Response.json({ error: "That code isn't right. Check it and try again." }, { status: 400 });
  }
  await db().execute({ sql: "DELETE FROM phone_codes WHERE learner_id = ?", args: [id] });
  const next = { ...prefs, phone: { ...prefs.phone, verified: true } };
  await db().execute({ sql: "UPDATE learners SET contact_prefs = ? WHERE id = ?", args: [JSON.stringify(next), id] });
  return Response.json(next);
}
