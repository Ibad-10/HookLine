import { requireLearner } from "@/lib/learner";
import { answer } from "./handler";

export async function POST(req: Request) {
  const id = await requireLearner();
  if (!id) return Response.json({ error: "no session" }, { status: 401 });
  const r = await answer(id, await req.json().catch(() => null));
  return Response.json(r.body, { status: r.status });
}
