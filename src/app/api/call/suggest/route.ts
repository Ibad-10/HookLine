// Practice calls in the order we suggest them, from the learner's weak spots.
import { SCENARIOS } from "@/lib/call/scenarios";
import { suggestCalls } from "@/lib/call/suggest";
import { allSkills, requireLearner } from "@/lib/learner";
import { whyText } from "@/lib/profile";

export async function GET(req: Request) {
  const id = await requireLearner({ signedIn: true });
  if (!id) return Response.json([], { status: 401 });
  const skip = new URL(req.url).searchParams.get("exclude");
  const skills = await allSkills(id);
  const list = suggestCalls(Object.values(SCENARIOS).filter((s) => s.id !== skip), skills);
  return Response.json(list.map(({ sc, pick }) => ({
    id: sc.id, title: sc.title, brand: sc.brand,
    why: whyText(pick, undefined, (skills.find((s) => s.key === pick.key)?.seen ?? 0) === 0),
  })));
}
