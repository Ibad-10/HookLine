import AppNav from "@/components/AppNav";
import Link from "next/link";
import { redirect } from "next/navigation";
import { learnerId } from "@/lib/learner";
import { loadSkills, weakness } from "@/lib/profile";
import { CATEGORIES, LABELS } from "@/lib/taxonomy";


function when(due: number) {
  const days = Math.round((due - Date.now()) / 86_400_000);
  if (days <= 0) return "Due now";
  return days === 1 ? "Back tomorrow" : `Back in ${days} days`;
}

export default async function Progress() {
  const id = await learnerId();
  if (!id) redirect("/start");
  const skills = (await loadSkills(id)).sort((a, b) => weakness(b) - weakness(a));
  const groups = [
    { title: "Types of scam", list: skills.filter((s) => (CATEGORIES as readonly string[]).includes(s.key)) },
    { title: "Tricks scammers use", list: skills.filter((s) => !(CATEGORIES as readonly string[]).includes(s.key)) },
  ];

  return (
    <>
    <AppNav />
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-[2.6rem] font-medium leading-none tracking-[-0.045em]">My <span className="font-serif font-light italic">progress</span></h1>
      <p className="mt-2 text-ink-soft">The longer the bar, the more confidently you spot it. Tricky ones come back sooner.</p>
      {!skills.length && <p className="mt-8 text-lg">Nothing yet. Finish a lesson and your progress shows here.</p>}
      {groups.map((g) =>
        g.list.length ? (
          <section key={g.title} className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight">{g.title}</h2>
            <ul className="mt-3 space-y-3">
              {g.list.map((s) => {
                const strength = Math.round((1 - weakness(s)) * 100);
                return (
                  <li key={s.key} className="rounded-2xl bg-card p-4 border border-line">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-bold">{(LABELS as Record<string, string>)[s.key] ?? s.key}</span>
                      <span className="shrink-0 text-sm text-ink-soft">{when(s.due_at)}</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-mist" role="img" aria-label={`${s.correct} right out of ${s.seen}`}>
                      <div className={`h-full rounded-full ${strength < 50 ? "bg-mark" : "bg-safe"}`} style={{ width: `${Math.max(6, strength)}%` }} />
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{s.correct} right out of {s.seen}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null,
      )}
    </main>
    </>
  );
}
