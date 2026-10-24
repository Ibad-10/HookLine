// Daily Learner scan (Vercel Cron): reads public scam-report feeds and turns new reports into
// briefs through Mubit, so lessons, emails and calls keep up with this week's scams.
import { ingest } from "@/lib/tasks/learner";

export const maxDuration = 300;

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response("forbidden", { status: 403 });
  const added = await ingest(10);
  console.log("learner scan", { added });
  return Response.json({ added });
}
