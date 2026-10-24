import { Flame, Phone } from "lucide-react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import HeroQuote from "@/components/HeroQuote";
import PathMap, { type Stop } from "@/components/PathMap";
import { db, migrate } from "@/lib/db";
import { allSkills, getLearner, learnerId, signedIn } from "@/lib/learner";
import { pickNext, streak, weakness, whyText } from "@/lib/profile";
import { LABELS } from "@/lib/taxonomy";
import { SCENARIOS } from "@/lib/call/scenarios";


export default async function Home() {
  if (!(await signedIn())) return <Welcome />;
  const id = await learnerId();
  const learner = id ? await getLearner(id) : null;
  if (!id || !learner) return <Welcome />;

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
      <main className="mx-auto max-w-xl space-y-5 px-4 pb-16 pt-8">
        <header className="px-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-[2.6rem] font-medium leading-none tracking-[-0.045em]">
              Hi <span className="font-serif font-light italic tracking-[-0.02em]">{first}</span>.
            </h1>
            <span className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold" title="Days practised in a row">
              <Flame aria-hidden className={`size-5 ${run.days ? "fill-mark text-mark" : "text-ink-soft"}`} />
              {run.days}<span className="sr-only"> days in a row</span>
            </span>
          </div>
          <p className="mt-3 text-lg text-ink-soft">
            {run.days > 1 ? `${run.days} days in a row. One short session a day is plenty.` : run.days === 1 ? "You practised today. See you tomorrow." : "Today's session takes about 3 minutes."}
            {run.freezeUsed && " We kept your streak through a missed day."}
          </p>
        </header>

        <section className="relative overflow-hidden rounded-2xl border border-line bg-mist p-6">
          <p className="text-sm font-medium text-ink-soft">Next lesson</p>
          <h2 className="mt-1 text-3xl font-medium tracking-[-0.03em]">{(LABELS as Record<string, string>)[pick.key]}</h2>
          <p className="mt-3 text-ink-soft"><span className="font-medium text-ink">Why this one: </span>{why}</p>
          <Link href="/lesson" className="btn-chunky mt-6 inline-grid w-full place-items-center bg-foreground text-lg text-background sm:w-auto">Start lesson</Link>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-black p-6 text-white">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex h-full items-end justify-around opacity-60">
            {[0, 1, 2].map((k) => <span key={k} className="glow-bar h-3/4 w-16" style={{ animationDelay: `${k * 1.3}s` }} />)}
          </div>
          <div className="relative">
            <p className="text-sm font-medium text-white/60">Practice call</p>
            <h2 className="mt-1 text-3xl font-medium tracking-[-0.03em]">Can you spot it on the <span className="font-serif font-light italic">phone</span>?</h2>
            <p className="mt-3 text-white/70">A pretend caller tries a trick. Hang up, ask questions, or ask if it&rsquo;s real. Nothing you say is kept.</p>
            <div className="mt-5 grid gap-2">
              {Object.values(SCENARIOS).map((s) => (
                <Link key={s.id} href={`/call/${s.id}`} className="glass flex items-center justify-between rounded-full py-2 pl-5 pr-2 font-medium transition-colors hover:bg-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                  {s.title}
                  <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-safe"><Phone className="size-5" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line px-5 pb-8 pt-6">
          <h2 className="text-3xl font-medium tracking-[-0.03em]">Your <span className="font-serif font-light italic">path</span></h2>
          <p className="mt-2 text-ink-soft">Tap any stop. Amber ones you spot well; they still come back now and then.</p>
          <div className="mt-12"><PathMap stops={stops} /></div>
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

function Welcome() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[70%] items-end justify-center gap-10">
        {[0, 1, 2, 3, 4].map((k) => (
          <span key={k} className="glow-bar w-20" style={{ height: `${[55, 80, 100, 80, 55][k]}%`, animationDelay: `${k * 0.9}s` }} />
        ))}
      </div>
      <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col justify-between px-5 py-6">
        <nav className="glass flex items-center justify-between rounded-full py-1.5 pl-5 pr-1.5" style={{ background: "rgba(0,0,0,0.6)" }}>
          <span className="text-lg font-semibold tracking-tight">Hookline</span>
          <Link href="/sign-in" className="rounded-full px-4 py-2.5 text-sm font-medium hover:bg-white/10">Sign in</Link>
        </nav>
        <div className="py-10">
          <span className="inline-block rounded-full border border-white/20 px-3 py-1 text-sm text-white/80">Scam practice for everyone</span>
          <h1 className="mt-6 text-[3.2rem] font-medium leading-[0.98] tracking-[-0.05em]">
            Spot the <span className="font-serif font-light italic tracking-[-0.02em]">hook</span> before it catches you.
          </h1>
          <div className="mt-8"><HeroQuote /></div>
          <p className="mt-6 text-lg text-white/70">
            Three-minute lessons from scams reported this week, and practice phone calls you&rsquo;re allowed to hang up on.
          </p>
        </div>
        <div className="grid gap-3">
          <Link href="/start" className="btn-chunky grid place-items-center bg-white text-lg text-black">Try a 1-minute check</Link>
          <Link href="/sign-up" className="btn-chunky grid place-items-center border border-white/25 text-lg text-white">Create a free account</Link>
        </div>
      </main>
    </div>
  );
}
