// Confirms the learner owns their practice-call number: texts a 6-digit code, then checks it.
// "Call me now" only rings numbers confirmed here.
import { createHash, randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { requireLearner } from "@/lib/learner";
import { contactPrefs } from "@/lib/practice";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

// Whether a code is waiting, and how long before another can be sent, so the page can lock
// the number and the button even after a reload.
export async function GET() {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json({ pending: false, wait: 0 });
  const row = (await db().execute({ sql: "SELECT number, expires_at FROM phone_codes WHERE learner_id = ?", args: [id] })).rows[0];
  const left = row ? Number(row.expires_at) - Date.now() : 0;
  return Response.json({ pending: left > 0, number: row?.number ?? null, wait: Math.max(0, Math.ceil((left - 9 * 60_000) / 1000)) });
}

export async function POST(req: Request) {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const prefs = await contactPrefs(id);
  if (!prefs.phone.on || !prefs.phone.number) return Response.json({ error: "Save your number first." }, { status: 400 });
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };

  if (!code) {
    const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_FROM_NUMBER: from } = process.env;
    if (!sid || !token || !from) return Response.json({ error: "Phone practice isn't set up yet." }, { status: 503 });
    const last = (await db().execute({ sql: "SELECT expires_at FROM phone_codes WHERE learner_id = ?", args: [id] })).rows[0];
    console.log("phone verify: send requested");
    if (last && Number(last.expires_at) - 9 * 60_000 > Date.now()) return Response.json({ error: "Wait a minute before asking for another code." }, { status: 429 });
    const fresh = String(randomInt(100000, 1000000));
    await db().execute({
      sql: "INSERT OR REPLACE INTO phone_codes (learner_id, number, hash, expires_at, tries) VALUES (?, ?, ?, ?, 0)",
      args: [id, prefs.phone.number, hash(fresh), Date.now() + 10 * 60_000],
    });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"), "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: prefs.phone.number, From: from, Body: `Your Hookline code is ${fresh}. It confirms this number for practice calls.` }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      console.error("phone verify: text failed", res.status, j.code, j.message);
      return Response.json({ error: `The code couldn't be sent: ${j.message ?? res.status}` }, { status: 502 });
    }
    return Response.json({ sent: true });
  }

  const row = (await db().execute({ sql: "SELECT number, hash, expires_at, tries FROM phone_codes WHERE learner_id = ?", args: [id] })).rows[0];
  if (!row || Number(row.expires_at) < Date.now() || Number(row.tries) >= 5 || row.number !== prefs.phone.number)
    return Response.json({ error: "That code has expired. Ask for a new one." }, { status: 400 });
  if (hash(code.trim()) !== row.hash) {
    await db().execute({ sql: "UPDATE phone_codes SET tries = tries + 1 WHERE learner_id = ?", args: [id] });
    return Response.json({ error: "That code isn't right. Check the text and try again." }, { status: 400 });
  }
  await db().execute({ sql: "DELETE FROM phone_codes WHERE learner_id = ?", args: [id] });
  const next = { ...prefs, phone: { ...prefs.phone, verified: true } };
  await db().execute({ sql: "UPDATE learners SET contact_prefs = ? WHERE id = ?", args: [JSON.stringify(next), id] });
  return Response.json(next);
}
