// Live: one lesson per arm from a seed brief. Run: npx tsx --env-file=.env scripts/lesson-live.mts
import seeds from "../src/data/seed-briefs.json" with { type: "json" };
import { Brief } from "../src/lib/schemas.ts";
import { writeLesson } from "../src/lib/tasks/teacher.ts";
import type { Arm } from "../src/lib/llm.ts";

const brief = Brief.parse(seeds[1]);
for (const arm of ["plain", "stuffed", "small"] as Arm[]) {
  const t = Date.now();
  const l = await writeLesson(brief, { weak: ["delivery_fee"], known: ["romance"] }, arm, "live", ["missed delivery_fee 2026-10-20"]);
  console.log(arm, l ? `OK "${l.title}" ${l.quiz.length}q` : "NULL", `${Date.now() - t}ms`);
}
