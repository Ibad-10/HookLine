// Audio for real practice calls that has no recording: lines of written-for-you calls and the
// caller's short small-talk replies. Same call token as the webhook; voiced in the caller's voice.
import { checkBrands } from "@/lib/brands";
import { getScenario } from "@/lib/call/getScenario";
import { validToken } from "@/lib/phone";
import { speech } from "@/lib/voiceCache";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const s = sp.get("s") ?? "";
  if (!validToken(s, sp.get("l") ?? "", sp.get("t"))) return new Response(null, { status: 403 });
  const sc = await getScenario(s);
  const text = sp.get("say") ?? (sc && sc.nodes[sp.get("node") ?? ""]?.line);
  if (!sc || !text || text.length > 300 || !checkBrands(text).ok) return new Response(null, { status: 400 });
  const mp3 = await speech(sc.voice || "JBFqnCBsd6RMkjVDRZzb", text);
  if (!mp3) return new Response(null, { status: 502 });
  return new Response(mp3 as BodyInit, { headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=86400" } });
}
