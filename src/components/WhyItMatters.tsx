"use client";
// The business case on the landing page: how big the problem is (sourced figures) and who pays.
import { motion } from "motion/react";

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
          <motion.a
            key={s.value}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            className="lift block rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 hover:bg-white/[0.09]"
          >
            <p className="text-4xl font-semibold tracking-[-0.04em] text-glow tabular-nums">{s.value}</p>
            <p className="mt-2 text-white/85">{s.label}</p>
            <p className="mt-3 text-xs text-white/45">{s.source}</p>
          </motion.a>
        ))}
      </div>

      <h3 className="mt-16 text-2xl font-medium tracking-[-0.03em]">Who it&rsquo;s for</h3>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {WHO.map((w) => (
          <li key={w.who} className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10">
            <p className="text-lg font-semibold">{w.who}</p>
            <p className="mt-1.5 text-white/70">{w.why}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
