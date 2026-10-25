// ElevenLabs speech for live call lines, kept in the database so a line made in the background is
// ready the moment Twilio asks for it.
import { createHash } from "node:crypto";
import { db, migrate } from "./db";

export async function speech(voice: string, text: string): Promise<Uint8Array | null> {
  await migrate();
  const key = createHash("sha256").update(`${voice}:${text}`).digest("hex");
  const hit = (await db().execute({ sql: "SELECT mp3 FROM tts_cache WHERE key = ?", args: [key] })).rows[0];
  if (hit) return Buffer.from(String(hit.mp3), "base64");
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_22050_32`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "", "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_turbo_v2_5" }),
  }).catch(() => null);
  if (!res?.ok) return null;
  const mp3 = Buffer.from(await res.arrayBuffer());
  await db().execute({ sql: "INSERT OR REPLACE INTO tts_cache (key, mp3, at) VALUES (?, ?, ?)", args: [key, mp3.toString("base64"), Date.now()] });
  return mp3;
}
