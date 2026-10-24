// Audio for real practice calls that has no recording: lines of written-for-you calls and the
// caller's short small-talk replies. Same call token as the webhook; voiced in the caller's voice.
import { checkBrands } from "@/lib/brands";
import { getScenario } from "@/lib/call/getScenario";
import { validToken } from "@/lib/phone";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const s = sp.get("s") ?? "";
  if (!validToken(s, sp.get("l") ?? "", sp.get("t"))) return new Response(null, { status: 403 });
  const sc = await getScenario(s);
  const text = sp.get("say") ?? (sc && sc.nodes[sp.get("node") ?? ""]?.line);
  if (!sc || !text || text.length > 300 || !checkBrands(text).ok) return new Response(null, { status: 400 });
  const voice = sc.voice || "JBFqnCBsd6RMkjVDRZzb";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_22050_32`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "", "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_flash_v2_5" }),
  });
  if (!res.ok) return new Response(null, { status: 502 });
  return new Response(res.body, { headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=86400" } });
}
