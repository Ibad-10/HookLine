// "Call me now": rings the signed-in learner's own confirmed number with a practice call
// written from their weak spots.
// A Twilio trial account can only call numbers verified on it.
import { SCENARIOS } from "@/lib/call/scenarios";
import { suggestCalls } from "@/lib/call/suggest";
import { allSkills, requireLearner } from "@/lib/learner";
import { writeCall } from "@/lib/tasks/caller";
import { briefForWeakSpot, weakestTricks } from "@/lib/weakest";
import { callToken } from "@/lib/phone";
import { contactPrefs, PUBLIC_URL, recentlySent, recordSend } from "@/lib/practice";

export async function POST() {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_FROM_NUMBER: from } = process.env;
  if (!sid || !token || !from) return Response.json({ error: "Phone practice isn't set up yet." }, { status: 503 });
  const prefs = await contactPrefs(id);
  if (!prefs.phone.on || !prefs.phone.number) return Response.json({ error: "Turn on practice calls and save your number first." }, { status: 400 });
  if (!prefs.phone.verified) return Response.json({ error: "Confirm your number with the text code first." }, { status: 400 });
  if (await recentlySent(id, "phone")) return Response.json({ error: "One practice call every 5 minutes, please." }, { status: 429 });

  // A call written from the learner's weak spots; if that fails, the best-matching recorded call.
  const skills = await allSkills(id);
  const written = await writeCall(await briefForWeakSpot(skills), weakestTricks(skills), id);
  const scenario = written?.id ?? suggestCalls(Object.values(SCENARIOS), skills)[0].sc.id;
  await recordSend(id, "phone", scenario);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: prefs.phone.number, From: from, Url: `${PUBLIC_URL()}/api/phone/twiml?s=${scenario}&l=${id}&start=1&t=${callToken(scenario, id)}` }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    return Response.json({ error: `The call couldn't start: ${j.message ?? res.status}` }, { status: 502 });
  }
  return Response.json({ ok: true });
}
