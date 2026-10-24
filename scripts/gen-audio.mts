// Pre-generates one MP3 per caller line with ElevenLabs. Skips files that exist.
// Run: npx tsx --env-file=.env scripts/gen-audio.mts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { SCENARIOS } from "../src/lib/call/scenarios.ts";

const key = process.env.ELEVENLABS_API_KEY;
const voice = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb"; // stock voice if none chosen
if (!key) throw new Error("Set ELEVENLABS_API_KEY in .env");

for (const sc of Object.values(SCENARIOS)) {
  mkdirSync(`public/audio/${sc.id}`, { recursive: true });
  for (const [node, n] of Object.entries(sc.nodes)) {
    const file = `public/audio/${sc.id}/${node}.mp3`;
    if (existsSync(file)) continue;
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({ text: n.line, model_id: "eleven_v3", seed: 7 }),
    });
    if (!res.ok) throw new Error(`${file}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log("wrote", file);
  }
}
