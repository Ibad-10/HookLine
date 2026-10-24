// Learner run: this week's public scam reports -> briefs. Run: npx tsx --env-file=.env scripts/ingest.mts
import { ingest } from "../src/lib/tasks/learner.ts";
console.log("briefs added:", await ingest(Number(process.argv[2] ?? 4)));
