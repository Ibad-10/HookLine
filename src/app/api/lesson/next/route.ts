import { learnerId, nextLesson } from "@/lib/learner";

export async function GET(req: Request) {
  const id = await learnerId();
  if (!id) return Response.json({ error: "no session" }, { status: 401 });
  return Response.json(await nextLesson(id, Date.now(), new URL(req.url).searchParams.get("topic") ?? undefined));
}
