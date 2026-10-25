// "Ask Sly": anyone can ask; a small per-visitor limit keeps it cheap.
import { allow } from "@/lib/limits";
import { learnerId } from "@/lib/learner";
import { askSly } from "@/lib/tasks/sly";

export async function POST(req: Request) {
  const { text } = (await req.json().catch(() => ({}))) as { text?: string };
  if (!text?.trim()) return Response.json({ error: "Ask me something first." }, { status: 400 });
  const who = (await learnerId()) ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  if (!(await allow("sly", who, 20, 60 * 60_000))) return Response.json({ error: "Let's take a breather. Ask me again in a little while." }, { status: 429 });
  const a = await askSly(text, `sly-${who}`);
  if (!a) return Response.json({ error: "Sorry, I couldn't think of an answer just now. Try again?" }, { status: 502 });
  return Response.json(a);
}
