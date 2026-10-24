import { applyPrefs, ContactPrefs, defaultPrefs, type Stored } from "@/lib/contact";
import { db, migrate } from "@/lib/db";
import { requireLearner } from "@/lib/learner";

async function load(id: string): Promise<Stored> {
  await migrate();
  const r = await db().execute({ sql: "SELECT contact_prefs FROM learners WHERE id = ?", args: [id] });
  const v = r.rows[0]?.contact_prefs;
  return v ? { ...defaultPrefs(), ...JSON.parse(String(v)) } : defaultPrefs();
}

export async function GET() {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json({ error: "no session" }, { status: 401 });
  return Response.json(await load(id));
}

export async function POST(req: Request) {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json({ error: "no session" }, { status: 401 });
  const b = ContactPrefs.safeParse(await req.json().catch(() => null));
  if (!b.success) return Response.json({ error: b.error.issues[0]?.message ?? "Check your details." }, { status: 400 });
  const next = applyPrefs(await load(id), b.data, Date.now());
  await db().execute({ sql: "UPDATE learners SET contact_prefs = ? WHERE id = ?", args: [JSON.stringify(next), id] });
  return Response.json(next);
}
