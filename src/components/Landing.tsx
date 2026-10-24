"use client";
// Signed-out landing (design canvas: "Landing (dark, scrolls)").
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import HeroQuote from "./HeroQuote";

const ease = [0.22, 0.61, 0.36, 1] as const;
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease },
};

const SECTIONS = [
  { n: "1 · Learn", a: "Lessons from this ", em: "week’s", b: " scams", body: "We read public scam reports and turn them into a short lesson you can finish on the bus.", quote: true },
  { n: "2 · Practise", a: "Calls you’re ", em: "allowed", b: " to hang up on", body: "A pretend caller tries a trick out loud. Ask questions, hang up, or ask “is this real?”. If you start giving real details, we stop the call." },
  { n: "3 · Remember", a: "Tricky ones come ", em: "back", b: "", body: "Hookline notices what catches you out and brings it back in two days, a week, then a month." },
];

export default function Landing() {
  const { scrollY } = useScroll();
  const [docked, setDocked] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setDocked(y > 420));

  return (
    <div className="dark min-h-dvh bg-black text-white">
      <nav className="glass fixed inset-x-4 top-3 z-40 mx-auto flex max-w-xl items-center justify-between rounded-full py-1.5 pl-5 pr-1.5" style={{ background: "rgba(0,0,0,0.72)" }}>
        <span className="text-lg font-semibold tracking-tight">Hookline</span>
        <span className="flex items-center gap-1">
          <Link href="/sign-in" className="rounded-full px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white">Sign in</Link>
          <motion.span initial={false} animate={{ opacity: docked ? 1 : 0, y: docked ? 0 : 12, scale: docked ? 1 : 0.9 }} transition={{ duration: 0.35, ease }}>
            <Link href="/sign-up" tabIndex={docked ? 0 : -1} aria-hidden={!docked}
              className="lift block rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black">Create account</Link>
          </motion.span>
        </span>
      </nav>

      <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-5 pt-20">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[70%] items-end justify-center gap-8">
          {[55, 85, 100, 75].map((h, k) => (
            <span key={k} className="glow-bar w-16" style={{ height: `${h}%`, animationDelay: `${k * 0.9}s` }} />
          ))}
        </div>
        <motion.div className="relative mx-auto w-full max-w-xl md:max-w-3xl md:text-center" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <span className="inline-block rounded-full border border-white/20 px-3 py-1 text-sm text-white/80">Scam practice for everyone</span>
          <h1 className="mt-5 text-[3.4rem] font-medium leading-[0.96] tracking-[-0.055em] md:text-[5.5rem]">
            Spot the <span className="font-serif font-light italic tracking-[-0.02em]">hook</span> before it catches you.
          </h1>
          <p className="mt-4 text-[1.15rem] text-white/72 md:text-xl">Three minutes a day, from this week’s real scams.</p>
          <div className="mt-7 grid gap-3 md:mx-auto md:max-w-md">
            <Link href="/start" className="btn-chunky lift shine grid place-items-center bg-white text-lg text-black">Try a 1-minute check</Link>
            <Link href="/sign-up" className="btn-chunky lift btn-grad grid place-items-center text-lg">Create a free account</Link>
          </div>
        </motion.div>
        <div aria-hidden className="cue absolute bottom-7 left-1/2 -ml-3.5 flex h-11 w-7 justify-center rounded-full pt-2 ring-[1.5px] ring-white/50">
          <span className="h-2 w-1 rounded-full bg-white" />
        </div>
      </section>

      <div className="mx-auto max-w-xl px-5 md:grid md:max-w-6xl md:grid-cols-3 md:gap-10">
        {SECTIONS.map((s) => (
          <motion.section key={s.n} {...reveal} className="py-12">
            <p className="text-sm text-[#7acaff]">{s.n}</p>
            <h2 className="mt-2 text-[2.1rem] font-medium leading-[1.05] tracking-[-0.04em]">
              {s.a}<span className="font-serif font-light italic">{s.em}</span>{s.b}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-white/68">{s.body}</p>
            {s.quote && <div className="mt-5 rounded-2xl bg-[#141414] p-4 ring-1 ring-white/10"><HeroQuote /></div>}
          </motion.section>
        ))}
        <motion.div {...reveal} className="pb-14 md:col-span-3 md:mx-auto md:w-full md:max-w-md">
          <Link href="/start" className="btn-chunky lift shine grid place-items-center bg-white text-lg text-black">Try a 1-minute check</Link>
        </motion.div>
      </div>

      <footer className="border-t border-white/10 px-5 pb-10 pt-7">
        <div className="mx-auto max-w-xl md:max-w-6xl">
          <p className="text-lg font-semibold tracking-tight">Hookline</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60">Practice only. We never ask for real card numbers, codes or passwords, and we never store them.</p>
          <nav aria-label="Legal" className="mt-4 flex flex-wrap gap-x-5 text-[0.95rem]">
            {[["/terms", "Terms and conditions"], ["/privacy", "Privacy"], ["/help", "If you’ve been scammed"], ["/mubit", "How our AI works"]].map(([href, label]) => (
              <Link key={href} href={href} className="inline-flex min-h-11 items-center text-white/85 underline-offset-4 hover:underline">{label}</Link>
            ))}
          </nav>
          <p className="mt-3 text-sm text-white/45">© 2026 Hookline</p>
        </div>
      </footer>
    </div>
  );
}
