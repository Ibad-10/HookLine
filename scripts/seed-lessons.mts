// One lesson per seed brief (frontier, plain arm) -> src/data/seed-lessons.json.
// Used for the starting quiz and as a fallback. Run: npx tsx --env-file=.env scripts/seed-lessons.mts
import { writeFileSync } from "node:fs";
import seeds from "../src/data/seed-briefs.json" with { type: "json" };
import { Brief } from "../src/lib/schemas.ts";
import { writeLesson } from "../src/lib/tasks/teacher.ts";

const out: Record<string, unknown> = {};
await Promise.all(seeds.map(async (s) => {
  const b = Brief.parse(s);
  for (let i = 0; i < 3 && !out[b.category]; i++) {
    const l = await writeLesson(b, { weak: [], known: [] }, "plain", `seed-${b.category}`);
    if (l) out[b.category] = l;
  }
  console.log(b.category, out[b.category] ? "ok" : "FAILED");
}));
writeFileSync("src/data/seed-lessons.json", JSON.stringify(out, null, 2));
