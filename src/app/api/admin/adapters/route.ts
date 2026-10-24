import { z } from "zod";
import { db, migrate } from "@/lib/db";
import { isAdmin } from "@/lib/learner";

const Task = z.object({
  status: z.string().max(60),
  kept_examples: z.number().int().min(0).max(100000).nullable(),
  agreement_pct: z.number().min(0).max(100).nullable(),
  test_cases: z.number().int().min(0).max(100000).nullable(),
});
const Body = z.object({ teacher: Task, coach: Task });

// Mubit has no API for adapter results, so an admin copies them from the console.
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "admins only" }, { status: 403 });
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return Response.json({ error: "check the numbers" }, { status: 400 });
  const value = JSON.stringify({ copied_at: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC", note: "Copied by hand from the Mubit console.", ...b.data });
  await migrate();
  await db().execute({ sql: "INSERT INTO settings (key, value) VALUES ('adapter_console', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value", args: [value] });
  return Response.json({ ok: true });
}
