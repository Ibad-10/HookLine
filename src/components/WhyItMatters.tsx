"use client";
// The business case on the landing page: how big the problem is (sourced figures) and who pays.
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// Counts up to a figure like "£1.17bn", "186,000", "$12.5bn" or "38%" once it scrolls into view.
function CountUp({ value }: { value: string }) {
  const m = value.match(/^([^\d]*)([\d,.]+)(.*)$/)!;
  const [pre, num, post] = [m[1], m[2], m[3]];
  const target = Number(num.replace(/,/g, ""));
  const decimals = num.includes(".") ? num.split(".")[1].length : 0;
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  const still = useReducedMotion();
  const [shown, setShown] = useState(still ? target : 0);
  useEffect(() => {
    if (!seen || still) return;
    const c = animate(0, target, { duration: 1.4, ease: [0.22, 0.61, 0.36, 1], onUpdate: setShown });
    return () => c.stop();
  }, [seen, still, target]);
  const text = shown.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span ref={ref} aria-label={value}>{pre}{text}{post}</span>;
}

// A card with a soft glow that follows the pointer.
function Spotlight({ children, href, i }: { children: React.ReactNode; href: string; i: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
    ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noreferrer"
      onPointerMove={move}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      className="group relative block overflow-hidden rounded-3xl bg-gradient-to-b from-white/20 via-white/5 to-[#0099ff]/30 p-px"
    >
      <span className="relative block h-full rounded-[calc(1.5rem-1px)] bg-[#0b0f14] p-6">
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(240px circle at var(--x, 50%) var(--y, 0%), rgba(0,153,255,0.18), transparent 70%)" }} />
        <span className="relative block">{children}</span>
      </span>
    </motion.a>
  );
}

const STATS = [
  { value: "£1.17bn", label: "stolen by fraud in the UK in 2024", source: "UK Finance, Annual Fraud Report 2025", href: "https://www.ukfinance.org.uk/policy-and-guidance/reports-and-publications/annual-fraud-report-2025" },
  { value: "186,000", label: "UK scams where people were tricked into paying, in one year", source: "UK Finance, 2025 (APP fraud cases, 2024)", href: "https://www.ukfinance.org.uk/news-and-insight/press-release/fraud-report-2025-press-release" },
  { value: "$12.5bn", label: "reported lost to fraud in the US in 2024, up 25%", source: "US Federal Trade Commission, March 2025", href: "https://www.ftc.gov/news-events/news/press-releases/2025/03/new-ftc-data-show-big-jump-reported-losses-fraud-125-billion-2024" },
  { value: "38%", label: "of people who reported a scam to the FTC lost money, up from 27%", source: "US Federal Trade Commission, 2024 data", href: "https://www.ftc.gov/news-events/news/press-releases/2025/03/new-ftc-data-show-big-jump-reported-losses-fraud-125-billion-2024" },
];

const WHO = [
  { who: "Banks", why: "In the UK, banks paid back £267m of scam losses in 2024. Fewer customers fooled means less to pay back." },
  { who: "Employers and insurers", why: "Staff and policy-holders who spot a fake call protect payroll, accounts and claims." },
  { who: "Families and care homes", why: "A gentle daily habit for parents and grandparents, with calls they can practise on safely." },
];

export default function WhyItMatters() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="max-w-3xl text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">
        Scams aren&rsquo;t <span className="font-serif font-light italic tracking-[-0.02em]">rare</span>. They&rsquo;re a daily business.
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-white/70">Most advice is a list of tips you read once. Hookline is practice, built from this week&rsquo;s real scams.</p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Spotlight key={s.value} href={s.href} i={i}>
            <span className="block text-4xl font-semibold tracking-[-0.04em] text-glow tabular-nums sm:text-5xl"><CountUp value={s.value} /></span>
            <span className="mt-2 block text-white/85">{s.label}</span>
            <span className="mt-4 inline-flex items-center gap-1 text-xs text-white/45 group-hover:text-white/70">{s.source} ↗</span>
          </Spotlight>
        ))}
      </div>

      <h3 className="mt-16 text-2xl font-medium tracking-[-0.03em]">Who it&rsquo;s for</h3>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {WHO.map((w) => (
          <li key={w.who} className="lift rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 ring-1 ring-white/10">
            <p className="text-lg font-semibold">{w.who}</p>
            <p className="mt-1.5 text-white/70">{w.why}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
