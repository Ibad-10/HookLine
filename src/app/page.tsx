import Link from "next/link";
import { db, migrate } from "@/lib/db";
import { allSkills, getLearner, learnerId } from "@/lib/learner";
import { pickNext, whyText } from "@/lib/profile";
import { LABELS } from "@/lib/taxonomy";
import { SCENARIOS } from "@/lib/call/scenarios";


export default async function Home() {
  const id = await learnerId();
  const learner = id ? await getLearner(id) : null;
  if (!id || !learner) return <Welcome />;

  const skills = await allSkills(id);
  const pick = pickNext(skills, Date.now(), 3)[0];
  await migrate();
  const miss = (await db().execute({ sql: "SELECT key, at FROM events WHERE learner_id = ? AND ok = 0 ORDER BY at DESC LIMIT 1", args: [id] })).rows[0];
  const why = whyText(pick, miss ? { key: String(miss.key), at: Number(miss.at) } : undefined, (skills.find((s) => s.key === pick.key)?.seen ?? 0) === 0);
  const days = new Set(
    (await db().execute({ sql: "SELECT at FROM events WHERE learner_id = ?", args: [id] })).rows.map((r) => new Date(Number(r.at)).toDateString()),
  ).size;
  const news = (await db().execute("SELECT brief_json, source_name FROM briefs ORDER BY published_at DESC LIMIT 1")).rows[0];

  return (
    <div className="min-h-dvh">
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-md px-5 pb-8 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-extrabold tracking-tight">Hookline</span>
            <nav className="flex gap-1 text-sm">
              <Link href="/progress" className="rounded-full px-3 py-2 hover:bg-navy-2">My progress</Link>
              <Link href="/settings" className="rounded-full px-3 py-2 hover:bg-navy-2">Settings</Link>
            </nav>
          </div>
          <h1 className="mt-8 text-[2rem] font-extrabold leading-tight">Hi {String(learner.nickname)}.</h1>
          <p className="mt-2 text-lg text-white/80">Today's session takes about 3 minutes.</p>
          <p className="mt-1 text-white/80">{days > 0 ? `You've practised on ${days} day${days > 1 ? "s" : ""}.` : "Your first session starts here."}</p>
        </div>
      </header>

      <main className="mx-auto -mt-4 max-w-md space-y-4 px-5 pb-12">
        <section className="rounded-3xl bg-card p-5 shadow-[0_2px_0_var(--line)]">
          <p className="text-sm font-bold text-tide">Next lesson</p>
          <h2 className="mt-1 text-2xl font-extrabold">{(LABELS as Record<string, string>)[pick.key]}</h2>
          <p className="mt-2 text-ink-soft"><span className="font-bold text-ink">Why this one: </span>{why}</p>
          <Link href="/lesson" className="btn-chunky mt-5 grid place-items-center bg-tide text-lg text-white">Start lesson</Link>
        </section>

        <section className="rounded-3xl bg-navy p-5 text-white">
          <p className="text-sm font-bold text-mark">Practice call</p>
          <h2 className="mt-1 text-2xl font-extrabold">Can you spot it on the phone?</h2>
          <p className="mt-2 text-white/80">A pretend caller tries a trick. Hang up, ask questions, or ask if it's real. Nothing you say is kept.</p>
          <div className="mt-4 grid gap-2">
            {Object.values(SCENARIOS).map((s) => (
              <Link key={s.id} href={`/call/${s.id}`} className="flex items-center justify-between rounded-2xl bg-navy-2 px-4 py-4 font-bold hover:bg-[#263d61]">
                {s.title}
                <span aria-hidden className="grid size-9 place-items-center rounded-full bg-safe">✆</span>
              </Link>
            ))}
          </div>
        </section>

        {news && (
          <section className="rounded-3xl bg-card p-5 shadow-[0_2px_0_var(--line)]">
            <p className="text-sm font-bold text-ink-soft">Reported this week</p>
            <h2 className="mt-1 text-xl font-extrabold">{JSON.parse(String(news.brief_json)).title}</h2>
            <p className="mt-2 text-ink-soft">
              Source:{" "}
              <a className="font-bold text-tide underline" href={JSON.parse(String(news.brief_json)).source_url} target="_blank" rel="noreferrer">
                {String(news.source_name)}
              </a>
            </p>
          </section>
        )}
        <p className="text-center text-sm text-ink-soft">
          <Link href="/mubit" className="underline">How Hookline's AI works, and what it costs</Link>
        </p>
      </main>
    </div>
  );
}

function Welcome() {
  return (
    <div className="min-h-dvh bg-navy text-white">
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-5 py-10">
        <span className="text-lg font-extrabold">Hookline</span>
        <div>
          <p className="text-xl leading-relaxed text-white/90">
            "Your parcel is waiting. Pay a <span className="mark text-navy">£1.45 fee within 30 minutes</span> or it goes back."
          </p>
          <h1 className="mt-8 text-[2.4rem] font-extrabold leading-[1.05]">Learn to spot the hook before it catches you.</h1>
          <p className="mt-4 text-lg text-white/80">
            Three-minute lessons from scams reported this week, and practice phone calls you're allowed to hang up on.
          </p>
        </div>
        <div className="grid gap-3">
          <Link href="/start" className="btn-chunky grid place-items-center bg-mark text-lg text-navy" style={{ "--btn-edge": "#c9a900" } as React.CSSProperties}>
            Start, it's free
          </Link>
          <p className="text-center text-sm text-white/70">No email or password needed.</p>
        </div>
      </main>
    </div>
  );
}
