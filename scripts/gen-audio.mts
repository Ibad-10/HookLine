// Pre-generates one MP3 per caller line in that call's voice, plus Hookline's narration.
// Skips files that exist; delete a folder to re-voice it.
// Run: npx tsx --env-file=.env scripts/gen-audio.mts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { SCENARIOS } from "../src/lib/call/scenarios.ts";
import { NARRATION, NARRATOR } from "../src/lib/voices.ts";

const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("Set ELEVENLABS_API_KEY in .env");

async function say(file: string, text: string, voice: string) {
  if (existsSync(file)) return;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key!, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_v3", seed: 7 }),
  });
  if (!res.ok) throw new Error(`${file}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log("wrote", file);
}

mkdirSync("public/audio/hookline", { recursive: true });
for (const [k, text] of Object.entries(NARRATION)) await say(`public/audio/hookline/${k}.mp3`, text, NARRATOR);
for (const sc of Object.values(SCENARIOS)) {
  mkdirSync(`public/audio/${sc.id}`, { recursive: true });
  for (const [node, n] of Object.entries(sc.nodes)) await say(`public/audio/${sc.id}/${node}.mp3`, n.line, sc.voice ?? "JBFqnCBsd6RMkjVDRZzb");
}
