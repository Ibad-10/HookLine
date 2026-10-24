// Off-script turn: masked text only. Gatecheck first on secret-asking steps, then the Coach.
import { z } from "zod";
import { gate } from "@/lib/gatekeeper";
import { getScenario } from "@/lib/call/getScenario";
import { requireLearner } from "@/lib/learner";
import { gateCheck, liveTurn } from "@/lib/tasks/coach";

const Body = z.object({
  scenarioId: z.string(),
  node: z.string(),
  masked: z.string().max(500),
  sessionId: z.string().max(100),
  recent: z.array(z.object({ who: z.enum(["caller", "you"]), text: z.string().max(400) })).max(6).default([]),
});

export async function POST(req: Request) {
  if (!(await requireLearner({ signedIn: true }))) return Response.json({ error: "no session" }, { status: 401 });
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: "bad request" }, { status: 400 });
  const { scenarioId, node, sessionId } = body.data;
  const sc = await getScenario(scenarioId);
  if (!sc?.nodes[node]) return Response.json({ error: "unknown scenario" }, { status: 400 });

  // Defence in depth: re-mask on the server in case a client skipped it.
  const masked = gate(body.data.masked, null).masked;
  const ask = sc.nodes[node].ask;
  if (ask && ask !== "money") {
    const g = await gateCheck(masked, ask, sessionId);
    if (g?.sensitive) return Response.json({ stop: true });
  }
  // Earlier learner turns were masked in the browser; mask again here in case a client skipped it.
  const transcript = body.data.recent.map((t) => ({ who: t.who, text: t.who === "you" ? gate(t.text, null).masked : t.text }));
  const state = { scenarioId, node, step: 0, transcript, outcome: null, checkpoints: [] };
  const move = await liveTurn(state, sc, masked, sessionId);
  return Response.json(move ?? { intent: "stall" });
}
