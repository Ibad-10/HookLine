// "Make a call for me": a practice call written from the learner's weakest scam type.
import { allSkills, requireLearner } from "@/lib/learner";
import { writeCall } from "@/lib/tasks/caller";
import { briefForWeakSpot, weakestTricks } from "@/lib/weakest";
import { db, migrate } from "@/lib/db";

export async function POST() {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json({ error: "Sign in first." }, { status: 401 });
  await migrate();
  const recent = (await db().execute({ sql: "SELECT 1 FROM gen_scenarios WHERE learner_id = ? AND created_at > ?", args: [id, Date.now() - 30_000] })).rows[0];
  if (recent) return Response.json({ error: "One new call every 30 seconds, please." }, { status: 429 });
  const skills = await allSkills(id);
  // Drafts that fail the safety checks are thrown away, so allow one more try.
  const sc = (await writeCall(await briefForWeakSpot(skills), weakestTricks(skills), id))
    ?? (await writeCall(await briefForWeakSpot(skills), weakestTricks(skills), id));
  if (!sc) return Response.json({ error: "We couldn't write a call just now. Try again, or pick one of the calls above." }, { status: 502 });
  return Response.json({ id: sc.id });
}
