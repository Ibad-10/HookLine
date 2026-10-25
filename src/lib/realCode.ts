import { contactPrefs } from "./practice";

// At the "read me the code" step, a real code really arrives by text (Twilio Verify, to the
// learner's own confirmed number), so the moment feels like the real thing.
export async function sendRealCode(learner: string) {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_VERIFY_SID: svc } = process.env;
  const prefs = await contactPrefs(learner);
  if (!svc || !prefs.phone.verified || !prefs.phone.number) return;
  await fetch(`https://verify.twilio.com/v2/Services/${svc}/Verifications`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: prefs.phone.number, Channel: "sms" }),
  }).catch(() => undefined);
}
