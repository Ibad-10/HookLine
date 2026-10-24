// Runs the same inputs through all three arms so the dashboard compares like with like.
import seeds from "@/data/seed-briefs.json";
import { startCall } from "@/lib/call/engine";
import { SCENARIOS } from "@/lib/call/scenarios";
import type { Arm } from "@/lib/llm";
import { Brief } from "@/lib/schemas";
import { coachMove } from "@/lib/tasks/coach";
import { adminOk } from "@/lib/learner";
import { writeLesson } from "@/lib/tasks/teacher";

export const maxDuration = 300;

const ARMS: Arm[] = ["plain", "stuffed", "small"];
const OFF_SCRIPT = ["my grandson usually does this for me", "sorry the kettle is boiling", "I'm on the bus right now", "can you text me instead", "I don't really use online banking"];

export async function POST(req: Request) {
  if (!adminOk(req)) return Response.json({ error: "admin key needed" }, { status: 403 });
  const briefs = seeds.slice(0, 5).map((b) => Brief.parse(b));
  const history = ["2026-10-18: missed a delivery_fee question", "2026-10-20: missed an urgency question", "2026-10-21: got a romance question right"];
  await Promise.all(
    briefs.map((b, i) =>
      Promise.all(ARMS.map((arm) => writeLesson(b, { weak: [b.category], known: ["romance"] }, arm, `compare-${i}`, history))),
    ),
  );
  const sc = SCENARIOS["safe-account"];
  await Promise.all(OFF_SCRIPT.map((t, i) => Promise.all(ARMS.map((arm) => coachMove(startCall(sc), sc, t, `compare-coach-${i}`, arm)))));
  return Response.json({ ok: true });
}
