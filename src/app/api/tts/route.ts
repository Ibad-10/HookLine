// Speaks a short caller line in the same ElevenLabs voice as the recorded clips.
// Signed-in only, short text only, and never a real brand.
import { checkBrands } from "@/lib/brands";
import { requireLearner } from "@/lib/learner";
import { ALL_VOICES } from "@/lib/voices";

export async function POST(req: Request) {
  if (!(await requireLearner({ signedIn: true }))) return new Response(null, { status: 401 });
  const { text, voice: asked } = (await req.json().catch(() => ({}))) as { text?: string; voice?: string };
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key || !text || text.length > 300 || !checkBrands(text).ok) return new Response(null, { status: 400 });
  const voice = asked && ALL_VOICES.includes(asked) ? asked : "JBFqnCBsd6RMkjVDRZzb";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_flash_v2_5" }),
  });
  if (!res.ok) return new Response(null, { status: 502 });
  return new Response(res.body, { headers: { "content-type": "audio/mpeg" } });
}
