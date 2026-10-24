import { isAdmin } from "@/lib/learner";
import { ingest } from "@/lib/tasks/learner";

export const maxDuration = 300;

export async function POST() {
  if (!(await isAdmin())) return Response.json({ error: "admins only" }, { status: 403 });
  return Response.json({ added: await ingest(4) });
}
