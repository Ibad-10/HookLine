import IncomingCall from "@/components/IncomingCall";
import { StreakBadge, WeekRow } from "@/components/Streak";
import Link from "next/link";
import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";
import PathMap, { type Stop } from "@/components/PathMap";
import { db, migrate } from "@/lib/db";
import { allSkills, getLearner, learnerId } from "@/lib/learner";
import { pickNext, streak, weakness, whyText } from "@/lib/profile";
import { LABELS } from "@/lib/taxonomy";
import { SCENARIOS } from "@/lib/call/scenarios";


export default async function Home() {
  const id = await learnerId();
  const learner = id ? await getLearner(id) : null;
  if (!id || !learner) redirect("/start");

  const skills = await allSkills(id);
  const pick = pickNext(skills, Date.now(), 3)[0];
  await migrate();
  const miss = (await db().execute({ sql: "SELECT key, at FROM events WHERE learner_id = ? AND key = ? AND ok = 0 ORDER BY at DESC LIMIT 1", args: [id, pick.key] })).rows[0];
  const why = whyText(pick, miss ? { key: String(miss.key), at: Number(miss.at) } : undefined, (skills.find((s) => s.key === pick.key)?.seen ?? 0) === 0);
  const times = (await db().execute({ sql: "SELECT at FROM events WHERE learner_id = ?", args: [id] })).rows.map((r) => Number(r.at));
  const run = streak(times, Date.now());
  const stops: Stop[] = skills.map((s) => ({
    key: s.key,
    label: (LABELS as Record<string, string>)[s.key],
    state: s.seen >= 2 && weakness(s) < 0.34 ? "strong" : s.seen > 0 ? "practising" : "new",
    next: s.key === pick.key,
  }));
  const news = (await db().execute("SELECT brief_json, source_name FROM briefs ORDER BY published_at DESC LIMIT 1")).rows[0];

  const first = String(learner.nickname);
  return (
    <div className="min-h-dvh">
      <AppNav />
      <main className="mx-auto max-w-xl space-y-5 px-4 pb-16 pt-8 md:grid md:max-w-5xl md:grid-cols-2 md:items-start md:gap-6 md:space-y-0">
        <header className="px-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-[2.6rem] font-medium leading-none tracking-[-0.045em]">
              Hi <span className="font-serif font-light italic tracking-[-0.02em]">{first}</span>.
            </h1>
            <StreakBadge days={run.days} />
          </div>
          <p className="mt-3 text-lg text-ink-soft">
            {run.days > 1 ? `${run.days} days in a row. One short session a day is plenty.` : run.days === 1 ? "You practised today. See you tomorrow." : "Today's session takes about 3 minutes."}
            {run.freezeUsed && " We kept your streak through a missed day."}
          </p>
          <WeekRow times={times} now={Date.now()} />
        </header>

        <section className="relative overflow-hidden rounded-2xl border border-line bg-mist p-6">
          <p className="text-sm font-medium text-ink-soft">Next lesson</p>
          <h2 className="mt-1 text-3xl font-medium tracking-[-0.03em]">{(LABELS as Record<string, string>)[pick.key]}</h2>
          <p className="mt-3 text-ink-soft"><span className="font-medium text-ink">Why this one: </span>{why}</p>
          <Link href="/lesson" className="btn-chunky lift shine btn-grad ready mt-6 grid w-full place-items-center text-lg">Start lesson</Link>
        </section>

        <IncomingCall main={SCENARIOS["safe-account"]} other={SCENARIOS["parcel-fee"]} />

        <section id="path" className="rounded-2xl border border-line px-5 pb-8 pt-6 md:col-start-2 md:row-span-4 md:row-start-1">
          <h2 className="text-3xl font-medium tracking-[-0.03em]">Your <span className="font-serif font-light italic">path</span></h2>
          <p className="mt-2 text-ink-soft">Tap any stop. Amber ones you spot well; they still come back now and then.</p>
          <div className="mt-10"><PathMap stops={stops} /></div>
        </section>

        {news && (
          <section className="rounded-2xl border border-line p-6">
            <p className="text-sm font-medium text-ink-soft">Reported this week</p>
            <h2 className="mt-1 text-xl font-medium tracking-[-0.02em]">{JSON.parse(String(news.brief_json)).title}</h2>
            <a className="mt-3 inline-block text-tide underline" href={JSON.parse(String(news.brief_json)).source_url} target="_blank" rel="noreferrer">
              Read it on {String(news.source_name)}
            </a>
          </section>
        )}
        <p className="text-center text-sm text-ink-soft">
          <Link href="/mubit" className="underline">How Hookline&rsquo;s AI works, and what it costs</Link>
        </p>
      </main>
    </div>
  );
}
