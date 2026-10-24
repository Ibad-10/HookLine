// Single-use token for ElevenLabs Scribe realtime, so the API key never reaches the browser.
export async function POST() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return Response.json({ error: "speech-to-text not configured" }, { status: 503 });
  const r = await fetch("https://api.elevenlabs.io/v1/single-use-token/realtime_scribe", { method: "POST", headers: { "xi-api-key": key } });
  if (!r.ok) return Response.json({ error: "token failed" }, { status: 502 });
  const { token } = await r.json();
  return Response.json({ token });
}
