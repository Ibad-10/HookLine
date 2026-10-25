"use client";
// Signed-out landing (design canvas: "Landing (dark, scrolls)").
import { useAuth } from "@clerk/nextjs";
import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { PillButton } from "./ui/pill-button";
import Logo from "./Logo";
import WhyItMatters from "./WhyItMatters";

const ease = [0.22, 0.61, 0.36, 1] as const;

const STEPS = [
  { n: "01", a: "Lessons from this ", em: "week’s", b: " scams", body: "We read public scam reports and turn them into a short lesson you can finish on the bus." },
  { n: "02", a: "Calls you’re ", em: "allowed", b: " to hang up on", body: "A pretend caller tries a trick out loud. Ask questions, hang up, or ask “is this real?”. If you start giving real details, we stop the call." },
  { n: "03", a: "Tricky ones come ", em: "back", b: "", body: "Hookline notices what catches you out and brings it back in two days, a week, then a month." },
];

function Nav() {
  const { isSignedIn } = useAuth();
  return (
    <nav
      aria-label="Main"
      className="fixed left-1/2 top-4 z-40 flex w-[min(calc(100%-2rem),56rem)] -translate-x-1/2 items-center justify-between rounded-full bg-[#111]/75 py-1.5 pl-3 pr-1.5 sm:pl-5 ring-1 ring-white/12 backdrop-blur-xl"
    >
      <Link href="/"><Logo /></Link>
      <div className="hidden items-center gap-1 text-[0.95rem] text-white/70 sm:flex">
        <a href="#why" className="rounded-full px-3 py-2 hover:text-white">Why it matters</a>
        <a href="#how" className="rounded-full px-3 py-2 hover:text-white">How it works</a>
        <Link href="/mubit" className="rounded-full px-3 py-2 hover:text-white">Our AI</Link>
      </div>
      <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
        {isSignedIn ? (
          <PillButton href="/home" size="sm">Open Hookline</PillButton>
        ) : (
          <>
            <Link href="/sign-in" className="rounded-full px-2 py-2 text-[0.95rem] text-white/80 hover:text-white sm:px-3">Sign in</Link>
            <PillButton href="/sign-up" size="sm">Get started</PillButton>
          </>
        )}
      </div>
    </nav>
  );
}

// The scam text: as it scrolls into view the highlighter marks the trick.
function ScamText() {
  return (
    <motion.figure
      className="rounded-3xl bg-[#111] p-5 ring-1 ring-white/10"
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease }}
    >
      <figcaption className="flex items-center gap-3 border-b border-white/10 pb-3">
        <span aria-hidden className="grid size-9 place-items-center rounded-full bg-white text-sm font-semibold text-black">S</span>
        <span className="font-medium">SwiftParcel</span>
        <span className="ml-auto text-sm text-white/50">Text message</span>
      </figcaption>
      <p className="mt-4 rounded-2xl rounded-tl-sm bg-white/[0.06] p-4 text-lg leading-relaxed">
        Your parcel is waiting. Pay a{" "}
        <motion.span
          className="rounded-[3px] px-0.5"
          style={{ backgroundImage: "linear-gradient(var(--mark), var(--mark))", backgroundRepeat: "no-repeat" }}
          initial={{ backgroundSize: "0% 100%", color: "#fff" }}
          whileInView={{ backgroundSize: "100% 100%", color: "#000" }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ delay: 0.5, duration: 0.7, ease }}
        >
          £1.45 fee within 30 minutes
        </motion.span>{" "}
        or it goes back to the sender.
      </p>
      <motion.p
        className="mt-3 text-sm text-mark"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
      >
        Trick spotted: rushing you, and an odd way to pay.
      </motion.p>
    </motion.figure>
  );
}

export default function Landing() {
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress: page } = useScroll();
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const glow = useTransform(scrollYProgress, [0, 1], [1, 1.4]);

  return (
    <div className="dark min-h-dvh bg-black text-white">
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-glow" style={{ scaleX: page }} />
      <Nav />

      <section ref={hero} className="relative flex min-h-[92dvh] flex-col items-center justify-center overflow-hidden px-5 pt-24 text-center">
        <motion.div aria-hidden style={{ scaleY: glow }} className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[65%] origin-bottom items-end justify-center gap-6 sm:gap-10">
          {[55, 85, 100, 75, 50].map((h, k) => (
            <span key={k} className="glow-bar w-12 sm:w-16" style={{ height: `${h}%`, animationDelay: `${k * 0.9}s` }} />
          ))}
        </motion.div>
        <motion.div style={{ y, opacity: fade }} className="relative w-full max-w-4xl">
          <motion.h1
            className="text-[2.9rem] font-medium leading-[0.98] tracking-[-0.055em] sm:text-7xl md:text-[5.5rem]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            Spot the <span className="font-serif font-light italic tracking-[-0.02em]">hook</span> before it catches you.
          </motion.h1>
          <motion.p className="mx-auto mt-5 max-w-md text-lg text-white/70 sm:text-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
            Three minutes a day, from this week’s real scams.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease }}
          >
            <PillButton href="/start" className="w-full sm:w-auto">Try a 1-minute check</PillButton>
            <PillButton href="/sign-up" variant="glow" className="w-full sm:w-auto">Create a free account</PillButton>
          </motion.div>
        </motion.div>
      </section>

      <WhyItMatters />

      <section id="how" className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-start md:gap-16">
        <div className="md:sticky md:top-28">
          <motion.h2
            className="text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
          >
            How <span className="font-serif font-light italic">Hookline</span> works
          </motion.h2>
          <div className="mt-8"><ScamText /></div>
        </div>
        <ol className="space-y-5">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.n}
              className="rounded-3xl bg-[#0d0d0d] p-6 ring-1 ring-white/10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
            >
              <span className="text-sm text-[#7acaff]">{s.n}</span>
              <h3 className="mt-2 text-2xl font-medium leading-tight tracking-[-0.035em] sm:text-3xl">
                {s.a}<span className="font-serif font-light italic">{s.em}</span>{s.b}
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-white/65">{s.body}</p>
            </motion.li>
          ))}
          <motion.li initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="pt-2">
            <PillButton href="/start" variant="glow" className="w-full sm:w-auto">Try a 1-minute check</PillButton>
          </motion.li>
        </ol>
      </section>

      <footer className="border-t border-white/10 px-5 pb-10 pt-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-lg font-semibold tracking-tight">Hookline</p>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/60">Practice only. We never ask for real card numbers, codes or passwords, and we never store them.</p>
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
