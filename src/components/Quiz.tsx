"use client";
// Lesson player: teach cards, then questions. Pick, Check, a feedback sheet slides
// up, Continue. Number keys pick, Enter checks or continues.
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/schemas";
import { LABELS } from "@/lib/taxonomy";
import MessageMock, { chunks } from "./MessageMock";

export type Item = { lessonId: string; q: number; question: Question };
type Result = { ok: boolean; answer_index?: number };

const label = (k: string) => (LABELS as Record<string, string>)[k] ?? k;

export default function Quiz({
  items,
  cards = [],
  title,
  onFinish,
  finishLabel = "Back to home",
}: {
  items: Item[];
  cards?: { heading: string; body: string }[];
  title: string;
  onFinish?: (score: number) => void;
  finishLabel?: string;
}) {
  const [i, setI] = useState(0); // position across cards + questions
  const [choice, setChoice] = useState<number | null>(null);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);

  const total = cards.length + items.length;
  const done = i >= total;
  const card = i < cards.length ? cards[i] : null;
  const item = !card && !done ? items[i - cards.length] : null;
  const q = item?.question;
  const flagSpans = useMemo(() => q?.flags?.map((f) => f.span) ?? [], [q]);
  const parts = useMemo(() => (q?.message ? chunks(q.message.text, flagSpans) : []), [q, flagSpans]);
  const ready = q ? (q.kind === "red_flags" ? tapped.size > 0 : choice !== null) : true;

  const next = useCallback(() => {
    setI((n) => n + 1);
    setChoice(null);
    setTapped(new Set());
    setResult(null);
  }, []);

  const check = useCallback(async () => {
    if (!item || !q || !ready || busy) return;
    setBusy(true);
    const spans = [...tapped].map((k) => parts[k]?.text).filter(Boolean);
    const body = { lessonId: item.lessonId, q: item.q, choice: choice ?? undefined, spans, last: i === total - 1 };
    try {
      const r: Result = await (await fetch("/api/answer", { method: "POST", body: JSON.stringify(body) })).json();
      setResult(r);
      if (r.ok) setScore((s) => s + 1);
    } finally {
      setBusy(false);
    }
  }, [item, q, ready, busy, tapped, parts, choice, i, total]);

  useEffect(() => {
    if (done) onFinish?.(score);
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "Enter") (card || result ? next() : check());
      const n = Number(e.key);
      if (!result && q && q.kind !== "red_flags" && n >= 1 && n <= (q.kind === "mc" ? q.options!.length : 2)) setChoice(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, result, q, next, check]);

  if (done)
    return (
      <main className="mx-auto max-w-md px-5 py-10 text-center">
        <div aria-hidden className="pop mx-auto mb-6 grid size-28 place-items-center rounded-full bg-mark text-5xl">✓</div>
        <h1 className="text-3xl font-extrabold">Lesson done</h1>
        <p className="mt-3 text-lg text-ink-soft">
          You spotted {score} of {items.length}. Anything you found tricky comes back in a few days.
        </p>
        <div className="mt-8 grid gap-3">
          <Link href="/call/safe-account" className="btn-chunky grid place-items-center bg-tide text-white">
            Try a practice call
          </Link>
          <Link href="/" className="font-bold text-tide py-3">{finishLabel}</Link>
        </div>
      </main>
    );

  return (
    <main className={`mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-4 ${result ? "pb-[30rem]" : "pb-40"}`}>
      <header className="flex items-center gap-4">
        <Link href="/" aria-label="Close lesson" className="grid size-11 place-items-center rounded-full text-2xl text-ink-soft hover:bg-white">
          ×
        </Link>
        <div className="h-4 flex-1 rounded-full bg-line" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i}>
          <div className="h-full rounded-full bg-tide transition-[width] duration-300" style={{ width: `${(i / total) * 100}%` }} />
        </div>
      </header>
      <p className="mt-5 text-sm font-bold text-ink-soft">{title}</p>

      {card && (
        <section className="mt-3">
          <h1 className="text-[1.7rem] font-extrabold leading-tight">{card.heading}</h1>
          <p className="mt-4 text-lg leading-relaxed">{card.body}</p>
        </section>
      )}

      {q && (
        <section className="mt-3">
          <h1 className="text-[1.5rem] font-extrabold leading-tight">{q.prompt}</h1>
          {q.kind === "red_flags" && !result && <p className="mt-2 text-ink-soft">Tap the words that make you suspicious.</p>}
          {q.kind === "real_or_scam" && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {["Scam", "Real"].map((t, k) => (
                <Choice key={t} n={k} label={t} choice={choice} result={result} onPick={setChoice} />
              ))}
            </div>
          )}
          {q.message && (
            <div className="mt-5">
              <MessageMock
                from={q.message.from}
                text={q.message.text}
                flags={flagSpans}
                tapped={tapped}
                revealed={!!result}
                onTap={q.kind === "red_flags" && !result ? (k) => setTapped((s) => new Set(s.has(k) ? [...s].filter((x) => x !== k) : [...s, k])) : undefined}
              />
            </div>
          )}
          {q.kind === "mc" && (
            <div className="mt-5 grid gap-3">
              {q.options!.map((o, k) => (
                <Choice key={k} n={k} label={o} choice={choice} result={result} onPick={setChoice} />
              ))}
            </div>
          )}
        </section>
      )}

      <div aria-live="polite" className="sr-only">
        {result ? (result.ok ? "Correct." : "Not quite.") : ""}
      </div>

      <footer
        className={`fixed inset-x-0 bottom-0 border-t-2 ${result ? (result.ok ? "border-safe bg-safe-bg sheet-in" : "border-alarm bg-alarm-bg sheet-in") : "border-line bg-mist"}`}
      >
        <div className="mx-auto max-w-md px-5 py-4">
          {result && q && (
            <div className="mb-4">
              <p className={`text-xl font-extrabold ${result.ok ? "text-safe" : "text-alarm"}`}>
                {result.ok ? "Well spotted" : "Not quite, here's the trick"}
              </p>
              <p className="mt-1 font-bold">Trick: {label(q.technique)}</p>
              {q.flags?.length ? (
                <ul className="mt-2 space-y-1">
                  {q.flags.map((f) => (
                    <li key={f.span}>
                      <span className="mark font-bold">{f.span}</span>: {f.why}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1">{q.explain}</p>
              )}
              <p className="mt-2"><span className="font-bold">In real life:</span> {q.safe_action}</p>
            </div>
          )}
          <button
            type="button"
            disabled={!card && !result && (!ready || busy)}
            onClick={card || result ? next : check}
            className="btn-chunky w-full bg-tide text-white text-lg"
            style={result && !result.ok ? ({ background: "var(--alarm)", "--btn-edge": "#8e2219" } as React.CSSProperties) : undefined}
          >
            {card ? "Next" : result ? "Continue" : busy ? "Checking…" : "Check"}
          </button>
        </div>
      </footer>
    </main>
  );
}

function Choice({
  n,
  label,
  choice,
  result,
  onPick,
}: {
  n: number;
  label: string;
  choice: number | null;
  result: Result | null;
  onPick: (n: number) => void;
}) {
  const picked = choice === n;
  const right = result && result.answer_index === n;
  const wrong = result && picked && !result.ok;
  return (
    <button
      type="button"
      aria-disabled={!!result}
      onClick={() => !result && onPick(n)}
      aria-pressed={picked}
      className={`btn-chunky w-full text-left text-[1.05rem] font-bold border-2 bg-card text-ink ${
        right ? "border-safe" : wrong ? "border-alarm" : picked ? "border-tide bg-[#e3f4f5]" : "border-line"
      }`}
      style={{ "--btn-edge": right ? "var(--safe)" : wrong ? "var(--alarm)" : picked ? "var(--tide)" : "var(--line)" } as React.CSSProperties}
    >
      <span className="mr-3 inline-grid size-7 place-items-center rounded-md border border-line text-sm text-ink-soft">{n + 1}</span>
      {label}
    </button>
  );
}
