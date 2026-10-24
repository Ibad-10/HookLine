// Off-script turn: masked text only. Gatecheck first on secret-asking steps, then the Coach.
import { z } from "zod";
import { gate } from "@/lib/gatekeeper";
import { SCENARIOS } from "@/lib/call/scenarios";
import { coachMove, gateCheck } from "@/lib/tasks/coach";

const Body = z.object({
  scenarioId: z.string(),
  node: z.string(),
  masked: z.string().max(500),
  sessionId: z.string().max(100),
});

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: "bad request" }, { status: 400 });
  const { scenarioId, node, sessionId } = body.data;
  const sc = SCENARIOS[scenarioId];
  if (!sc?.nodes[node]) return Response.json({ error: "unknown scenario" }, { status: 400 });

  // Defence in depth: re-mask on the server in case a client skipped it.
  const masked = gate(body.data.masked, null).masked;
  const ask = sc.nodes[node].ask;
  if (ask && ask !== "money") {
    const g = await gateCheck(masked, ask, sessionId);
    if (g?.sensitive) return Response.json({ stop: true });
  }
  const state = { scenarioId, node, step: 0, transcript: [], outcome: null, checkpoints: [] };
  const move = await coachMove(state, sc, masked, sessionId);
  return Response.json(move ?? { intent: "stall" });
}
