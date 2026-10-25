import { notFound } from "next/navigation";
import Link from "next/link";
import MubitDashboard, { readAdapterInfo } from "@/components/MubitDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, migrate } from "@/lib/db";
import { isAdmin } from "@/lib/learner";
import { CATEGORIES, LABELS } from "@/lib/taxonomy";
import { AdapterForm, RefreshNews } from "./AdminActions";
import AppNav from "@/components/AppNav";

const DAY = 86_400_000;
const n = async (sql: string, args: (string | number)[] = []) => Number((await db().execute({ sql, args })).rows[0]?.n ?? 0);

export default async function Admin() {
  if (!(await isAdmin())) notFound();
  await migrate();
  const week = Date.now() - 7 * DAY;
  const stats = {
    learners: await n("SELECT COUNT(*) n FROM learners"),
    accounts: await n("SELECT COUNT(*) n FROM learners WHERE clerk_user_id IS NOT NULL"),
    active: await n("SELECT COUNT(DISTINCT learner_id) n FROM events WHERE at > ?", [week]),
    lessons: await n("SELECT COUNT(*) n FROM events WHERE kind = 'lesson_done'"),
    answers: await n("SELECT COUNT(*) n FROM events WHERE kind = 'quiz'"),
    calls: await n("SELECT COUNT(DISTINCT at) n FROM events WHERE kind = 'call'"),
  };
  const spread = (
    await db().execute(
      `SELECT key, SUM(seen) seen, SUM(correct) correct FROM skills WHERE key IN (${CATEGORIES.map(() => "?").join(",")}) GROUP BY key ORDER BY (SUM(seen) - SUM(correct)) * 1.0 / MAX(SUM(seen), 1) DESC`,
      [...CATEGORIES],
    )
  ).rows.map((r) => ({ key: String(r.key), seen: Number(r.seen), missed: Number(r.seen) - Number(r.correct) }));
  const briefs = (await db().execute("SELECT brief_json, source_name, published_at FROM briefs ORDER BY published_at DESC LIMIT 15")).rows;
  const lessons = (await db().execute("SELECT lesson_json, created_at FROM lessons ORDER BY created_at DESC LIMIT 10")).rows;
  const adapter = await readAdapterInfo();

  return (
    <>
    <AppNav />
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="text-[2.6rem] font-medium leading-none tracking-[-0.045em]">
        Admin <span className="font-serif font-light italic tracking-[-0.02em]">console</span>
      </h1>
      <Tabs defaultValue="mubit" className="mt-6">
        <TabsList className="h-12 flex-wrap">
          <TabsTrigger value="mubit" className="px-4">Mubit</TabsTrigger>
          <TabsTrigger value="learners" className="px-4">Learners</TabsTrigger>
          <TabsTrigger value="content" className="px-4">Content</TabsTrigger>
          <TabsTrigger value="adapters" className="px-4">Adapters</TabsTrigger>
        </TabsList>

        <TabsContent value="mubit" className="-mx-4 sm:-mx-8">
          <MubitDashboard admin />
        </TabsContent>

        <TabsContent value="learners" className="space-y-8 pt-4">
          <p className="text-ink-soft">Totals only. No names, emails or answers are shown here.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Learners", stats.learners],
              ["With an account", stats.accounts],
              ["Active this week", stats.active],
              ["Lessons finished", stats.lessons],
              ["Answers checked", stats.answers],
              ["Practice calls", stats.calls],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-line bg-card p-5">
                <p className="text-4xl font-medium tabular-nums tracking-[-0.04em]">{Number(value).toLocaleString()}</p>
                <p className="mt-1 text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
          <section>
            <h2 className="text-2xl font-medium tracking-[-0.02em]">What people find hardest</h2>
            <p className="mt-1 text-ink-soft">Share of answers missed, by type of scam.</p>
            <ul className="mt-4 space-y-3">
              {spread.map((s) => (
                <li key={s.key}>
                  <div className="flex justify-between text-sm"><span className="font-medium">{(LABELS as Record<string, string>)[s.key]}</span><span className="tabular-nums text-ink-soft">{s.missed} of {s.seen} missed</span></div>
                  <div className="mt-1 h-2.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(s.missed / Math.max(s.seen, 1)) * 100}%` }} /></div>
                </li>
              ))}
              {!spread.length && <li className="text-ink-soft">No answers yet.</li>}
            </ul>
          </section>
        </TabsContent>

        <TabsContent value="content" className="space-y-8 pt-4">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-medium tracking-[-0.02em]">This week&rsquo;s scam reports</h2>
              <RefreshNews />
            </div>
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-card">
              {briefs.map((b, k) => {
                const j = JSON.parse(String(b.brief_json));
                return (
                  <li key={k} className="flex flex-wrap items-baseline justify-between gap-2 p-4">
                    <span><span className="font-medium">{j.title}</span> <span className="text-ink-soft">({(LABELS as Record<string, string>)[j.category]})</span></span>
                    <a href={j.source_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">{String(b.source_name)}, {j.published_at}</a>
                  </li>
                );
              })}
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-medium tracking-[-0.02em]">Latest lessons written</h2>
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-card">
              {lessons.map((l, k) => (
                <li key={k} className="flex justify-between gap-2 p-4">
                  <span className="font-medium">{JSON.parse(String(l.lesson_json)).title}</span>
                  <span className="shrink-0 text-sm text-ink-soft">{new Date(Number(l.created_at)).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</span>
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>

        <TabsContent value="adapters" className="pt-4">
          <p className="max-w-2xl text-ink-soft">
            Mubit has no API for adapter results yet. Open the Mubit console (Adapters, then Try models), copy the numbers here, and save. They
            show on the dashboard with the time you saved them.
          </p>
          <AdapterForm initial={adapter} />
        </TabsContent>
      </Tabs>
    </main>
    </>
  );
}
