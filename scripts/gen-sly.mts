// Sly's voice lines (ElevenLabs, one bright British voice). Skips files that exist.
// Run: npx tsx --env-file=.env scripts/gen-sly.mts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { SLY_LINES, SLY_VOICE } from "../src/lib/sly.ts";

mkdirSync("public/audio/sly", { recursive: true });
for (const [k, text] of Object.entries(SLY_LINES)) {
  const file = `public/audio/sly/${k}.mp3`;
  if (existsSync(file)) continue;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${SLY_VOICE}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_v3", seed: 11 }),
  });
  if (!res.ok) throw new Error(`${k}: ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log("wrote", file);
}
