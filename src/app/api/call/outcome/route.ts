// Records a finished practice call against the learner's profile. Checkpoints only, never transcripts.
import { z } from "zod";
import { SCENARIOS } from "@/lib/call/scenarios";
import { requireLearner } from "@/lib/learner";
import { saveOutcome } from "@/lib/profile";

const Body = z.object({ scenarioId: z.string(), outcome: z.enum(["pass", "stopped", "scammed"]), nodes: z.array(z.string()).max(40) });

export async function POST(req: Request) {
  const id = await requireLearner({ signedIn: true });
  const b = Body.safeParse(await req.json().catch(() => null));
  const sc = b.success ? SCENARIOS[b.data.scenarioId] : undefined;
  if (!id || !b.success || !sc) return Response.json({ error: "bad request" }, { status: 400 });
  const tricks = [...new Set(b.data.nodes.map((n) => sc.nodes[n]?.technique).filter(Boolean))];
  await saveOutcome(id, [sc.category, ...tricks], b.data.outcome === "pass", "call");
  return Response.json({ ok: true });
}
