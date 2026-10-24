"use client";
// Lesson player: teach cards, then questions. Pick, Check, a feedback sheet slides
// up, Continue. Number keys pick, Enter checks or continues.
import confetti from "canvas-confetti";
import { ArrowRight, Check, ChevronLeft, X } from "lucide-react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playDone, playRight, playWrong } from "@/lib/sound";
import Buoy, { BuoyTip } from "./Buoy";
import type { Question } from "@/lib/schemas";
import { LABELS } from "@/lib/taxonomy";
import MessageMock, { chunks } from "./MessageMock";

export type Item = { lessonId: string; q: number; question: Question };
type Result = { ok: boolean; answer_index?: number };

const label = (k: string) => (LABELS as Record<string, string>)[k] ?? k;

const TIP: Record<Question["kind"], string> = {
  red_flags: "Look at who it's from, what it wants, and how fast it wants it.",
  real_or_scam: "Would a real company really contact you like this?",
  mc: "Think about what the real organisation would do.",
};

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const c = animate(0, to, { duration: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => ref.current && (ref.current.textContent = String(Math.round(v))) });
    return () => c.stop();
  }, [to]);
  return <span ref={ref}>0</span>;
}

export default function Quiz({
  items,
  cards = [],
  title,
  onFinish,
  finishLabel = "Back to home",
  next: after = { href: "/call/safe-account", label: "Try a practice call" },
}: {
  items: Item[];
  cards?: { heading: string; body: string }[];
  title: string;
  onFinish?: (score: number) => void;
  finishLabel?: string;
  next?: { href: string; label: string };
}) {
  const [i, setI] = useState(0); // position across cards + questions
  const [choice, setChoice] = useState<number | null>(null);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [inARow, setInARow] = useState(0);
  const reduce = useReducedMotion();

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
      if (r.ok) {
        setScore((s) => s + 1);
        setInARow((n) => n + 1);
        playRight();
      } else {
        setInARow(0);
        playWrong();
      }
    } finally {
      setBusy(false);
    }
  }, [item, q, ready, busy, tapped, parts, choice, i, total]);

  useEffect(() => {
    if (!done) return;
    onFinish?.(score);
    playDone();
    if (!reduce)
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.35 }, colors: ["#ffb840", "#0e7c86", "#000000", "#17804f"], disableForReducedMotion: true });
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
        <div className="mx-auto mb-4 w-fit"><Buoy mood="cheer" size={120} /></div>
        <h1 className="text-3xl font-semibold tracking-tight">{after.href === "/sign-up" ? "Check done" : "Lesson done"}</h1>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 text-5xl font-semibold tracking-tight tabular-nums text-tide">
          <CountUp to={score} />
          <span className="text-2xl text-ink-soft"> of {items.length} spotted</span>
        </motion.p>
        <p className="mt-3 text-lg text-ink-soft">Anything you found tricky comes back in a few days.</p>
        <div className="mt-8 grid gap-3">
          <Link href={after.href} className="btn-chunky grid place-items-center bg-tide text-white">
            {after.label}
          </Link>
          <Link href="/" className="font-bold text-tide py-3">{finishLabel}</Link>
        </div>
      </main>
    );

  return (
    <main className={`mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-4 ${result ? "pb-[30rem]" : "pb-40"}`}>
      <header className="flex items-center gap-4">
        <Link href="/" aria-label="Back to home" className="flex h-11 shrink-0 items-center gap-1 rounded-full bg-secondary pl-2.5 pr-3.5 text-[0.95rem] font-semibold ring-1 ring-line">
          <ChevronLeft aria-hidden className="size-5" strokeWidth={2.4} />
          Home
        </Link>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i}>
          <motion.div className="relative h-full overflow-hidden rounded-full bg-tide" animate={{ width: `${Math.max(4, (i / total) * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }}>
            <span aria-hidden className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/35" />
          </motion.div>
        </div>
        <AnimatePresence>
          {inARow >= 2 && result?.ok && (
            <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="shrink-0 rounded-full bg-mark px-3 py-1 text-sm font-semibold tracking-tight text-navy">
              {inARow} in a row
            </motion.span>
          )}
        </AnimatePresence>
      </header>
      <p className="mt-5 text-sm font-bold text-ink-soft">{title}</p>

      <AnimatePresence mode="wait" initial={false}>
      <motion.div key={i} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
      {card && (
        <section className="mt-3">
          <h1 className="text-[1.7rem] font-semibold tracking-tight leading-tight">{card.heading}</h1>
          <p className="mt-4 text-lg leading-relaxed">{card.body}</p>
        </section>
      )}

      {q && (
        <section className="mt-3">
          <div className="mb-4">
            <BuoyTip mood={result ? (result.ok ? "happy" : "hmm") : "idle"}>
              {result ? (result.ok ? `Nice. That's the "${label(q.technique).toLowerCase()}" trick.` : `Easy to miss. Watch for "${label(q.technique).toLowerCase()}".`) : TIP[q.kind]}
            </BuoyTip>
          </div>
          <h1 className="text-[1.5rem] font-semibold tracking-tight leading-tight">{q.prompt}</h1>
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

      </motion.div>
      </AnimatePresence>

      <div aria-live="polite" className="sr-only">
        {result ? (result.ok ? "Correct." : "Not quite.") : ""}
      </div>

      <motion.footer
        key={result ? "result" : "ask"}
        initial={result ? { y: "100%" } : false}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className={`fixed inset-x-0 bottom-0 border-t-2 ${result ? (result.ok ? "border-safe bg-safe-bg" : "border-alarm bg-alarm-bg") : "border-line bg-mist"}`}
      >
        <div className="mx-auto max-w-md px-5 py-4">
          {result && q && (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span aria-hidden className={`badge-pop grid size-11 shrink-0 place-items-center rounded-full text-white ${result.ok ? "bg-safe shadow-[0_0_0_6px_rgba(15,122,70,0.15)]" : "bg-alarm shadow-[0_0_0_6px_rgba(201,52,42,0.15)]"}`}>
                  {result.ok ? <Check className="size-6" strokeWidth={3} /> : <X className="size-6" strokeWidth={3} />}
                </span>
                <p className={`text-[1.9rem] font-semibold leading-none tracking-[-0.04em] ${result.ok ? "text-safe" : "text-alarm"}`}>
                  {result.ok ? <>Well <span className="font-serif font-light italic">spotted</span></> : <>Not <span className="font-serif font-light italic">quite</span></>}
                </p>
              </div>
              <p className={`mt-2.5 inline-block rounded-full bg-background px-3 py-1 text-sm font-semibold ring-1 ${result.ok ? "text-safe ring-safe/25" : "text-alarm ring-alarm/25"}`}>
                Trick: {label(q.technique)}
              </p>
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
            className={`btn-chunky lift flex w-full items-center justify-center gap-2 text-lg ${!card && !result && (!ready || busy) ? "" : `btn-grad shine ${result ? "ready" : ""}`}`}
            style={result && !result.ok ? ({ background: "linear-gradient(180deg, #e0574c, #c9342a)" } as React.CSSProperties) : undefined}
          >
            {card ? "Next" : result ? "Continue" : busy ? "Checking…" : "Check"}
            {(card || result) && <ArrowRight className="size-5" aria-hidden />}
          </button>
        </div>
      </motion.footer>
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
        right ? "border-safe" : wrong ? "border-alarm" : picked ? "border-tide bg-accent" : "border-line"
      }`}
      style={{ "--btn-edge": right ? "var(--safe)" : wrong ? "var(--alarm)" : picked ? "var(--tide)" : "var(--line)" } as React.CSSProperties}
    >
      <span className="mr-3 inline-grid size-7 place-items-center rounded-md border border-line text-sm text-ink-soft">{n + 1}</span>
      {label}
    </button>
  );
}
