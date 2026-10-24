// Pulls more public scam reports into briefs (Learner task). Run: npx tsx --env-file=.env scripts/ingest-more.mts 15
import { ingest } from "../src/lib/tasks/learner.ts";
console.log("briefs added:", await ingest(Number(process.argv[2] ?? 15)));
