// Sends one practice email to the signed-in learner's own account address (opted in).
// Written fresh each time by the Mailer from a public scam brief about one of the learner's weak spots (made-up brand, checked);
// one link back to Hookline's review page, no forms.
import { currentUser } from "@clerk/nextjs/server";
import { allSkills, requireLearner } from "@/lib/learner";
import { briefForWeakSpot } from "@/lib/weakest";
import { db } from "@/lib/db";
import { contactPrefs, PUBLIC_URL, recentlySent, recordSend } from "@/lib/practice";
import { renderEmail } from "@/lib/emailLayouts";
import { writeEmail, type Email } from "@/lib/tasks/mailer";

// Used only if the Mailer fails, so the button still works.
const FALLBACK: Email = {
  brand: "SwiftParcel",
  subject: "Your parcel is waiting: small fee due",
  paragraphs: [
    "We tried to deliver your parcel today but a redelivery fee of £1.45 is unpaid.",
    "Pay within 30 minutes or the parcel will be returned to the sender.",
  ],
  button: "Pay the fee now",
  flags: [
    { span: "within 30 minutes", why: "A short deadline rushes you so you don't check." },
    { span: "redelivery fee of £1.45", why: "Small fees feel safe; the real aim is your card details." },
  ],
};

export async function POST() {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ error: "Email practice isn't set up yet." }, { status: 503 });
  const prefs = await contactPrefs(id);
  if (!prefs.email.on) return Response.json({ error: "Turn on practice emails first." }, { status: 400 });
  if (await recentlySent(id, "email")) return Response.json({ error: "One practice email every 5 minutes, please." }, { status: 429 });
  const to = (await currentUser())?.primaryEmailAddress?.emailAddress;
  if (!to) return Response.json({ error: "Your account has no email address." }, { status: 400 });

  const used = (await db().execute({ sql: "SELECT detail FROM practice_sends WHERE learner_id = ? AND channel = 'email' AND detail IS NOT NULL ORDER BY sent_at DESC LIMIT 20", args: [id] }))
    .rows.map((r) => (JSON.parse(String(r.detail)) as { subject: string }).subject);
  const brief = await briefForWeakSpot(await allSkills(id)); // aimed at the learner's weakest scam types
  const mail = (await writeEmail(brief, used, `mailer-${id}`)) ?? FALLBACK;

  const sendId = await recordSend(id, "email", brief.category);
  await db().execute({ sql: "UPDATE practice_sends SET detail = ? WHERE id = ?", args: [JSON.stringify({ brand: mail.brand, subject: mail.subject, flags: mail.flags }), sendId] });
  const link = `${PUBLIC_URL()}/practice/${sendId}`;
  const html = renderEmail(mail, link);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.PRACTICE_EMAIL_FROM || `${mail.brand.replace(/[<>"]/g, "")} (Hookline practice) <onboarding@resend.dev>`,
      to: [to],
      subject: mail.subject,
      html,
    }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    return Response.json({ error: `The email couldn't be sent: ${j.message ?? res.status}` }, { status: 502 });
  }
  return Response.json({ ok: true, to });
}
