// Sends one practice email to the signed-in learner's own account address (opted in).
// Made-up brand, one link back to Hookline's review page, no forms.
import { currentUser } from "@clerk/nextjs/server";
import { requireLearner } from "@/lib/learner";
import { contactPrefs, PUBLIC_URL, recentlySent, recordSend } from "@/lib/practice";

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

  const sendId = await recordSend(id, "email", "parcel-fee");
  const link = `${PUBLIC_URL()}/practice/${sendId}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111">
  <p style="font-size:20px;font-weight:bold;color:#c0392b">SwiftParcel</p>
  <p>Hello,</p>
  <p>We tried to deliver your parcel today but a redelivery fee of <b>£1.45</b> is unpaid. Pay within <b>30 minutes</b> or the parcel will be returned to the sender.</p>
  <p><a href="${link}" style="display:inline-block;background:#c0392b;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">Pay the fee now</a></p>
  <p style="color:#555">SwiftParcel Customer Care</p>
  <hr style="margin-top:40px;border:none;border-top:1px solid #ddd">
  <p style="font-size:12px;color:#777">This is a Hookline practice email you opted in to. SwiftParcel is made up. Turn practice emails off in Hookline Settings at any time.</p>
</div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.PRACTICE_EMAIL_FROM || "SwiftParcel (Hookline practice) <onboarding@resend.dev>",
      to: [to],
      subject: "Your parcel is waiting: small fee due",
      html,
    }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    return Response.json({ error: `The email couldn't be sent: ${j.message ?? res.status}` }, { status: 502 });
  }
  return Response.json({ ok: true, to });
}
