"use client";
// Lesson path: stops joined by a rope, raised and pressable (design canvas: Home).
// The recommended stop is bigger and says Start. Nothing is locked.
import {
  Briefcase, Check, Heart, KeyRound, Landmark, Laptop, Package, Receipt, ShoppingBag, TrendingUp, Users, type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const ICON: Record<string, LucideIcon> = {
  bank_impersonation: Landmark, delivery_fee: Package, tax_refund: Receipt, family_emergency: Users, tech_support: Laptop,
  investment_crypto: TrendingUp, romance: Heart, job_task: Briefcase, marketplace_purchase: ShoppingBag, account_takeover_code: KeyRound,
};

export type Stop = { key: string; label: string; state: "strong" | "practising" | "new"; next: boolean };

const STEP = 128; // px between stops
const offset = (i: number) => Math.round(Math.sin(i * 1.1) * 70);

export default function PathMap({ stops }: { stops: Stop[] }) {
  const h = stops.length * STEP;
  // Rope through each stop's centre (box 300 wide, centre line at 150).
  const pts = stops.map((_, i) => [150 + offset(i), i * STEP + 40]);
  const d = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = pts[i - 1];
    return `${acc} C ${px} ${py + STEP / 2}, ${x} ${y - STEP / 2}, ${x} ${y}`;
  }, "");

  return (
    <div className="relative mx-auto w-[300px]" style={{ height: h }}>
      <svg aria-hidden width="300" height={h} viewBox={`0 0 300 ${h}`} className="absolute inset-0">
        <path d={d} fill="none" stroke="#e6d3ae" strokeWidth="10" strokeLinecap="round" />
        <path d={d} fill="none" stroke="#c98a1c" strokeWidth="10" strokeLinecap="round" strokeDasharray="2 14" />
      </svg>
      <ol aria-label="Your lesson path" className="relative">
        {stops.map((s, i) => {
          const Icon = ICON[s.key] ?? Package;
          const look = s.next
            ? { cls: "size-20 btn-grad", edge: "#004f84" }
            : s.state === "strong"
              ? { cls: "size-16 bg-mark text-black", edge: "#c98a1c" }
              : s.state === "practising"
                ? { cls: "size-16 bg-card text-tide outline outline-4 outline-tide/25", edge: "#b9c7d6" }
                : { cls: "size-16 bg-secondary text-ink-soft", edge: "#d4d4d4" };
          return (
            <motion.li
              key={s.key}
              className="absolute flex w-36 flex-col items-center"
              style={{ left: 150 + offset(i) - 72, top: i * STEP + 40 - (s.next ? 40 : 32) }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {s.next && (
                <span className="absolute left-[calc(50%+46px)] top-6 whitespace-nowrap rounded-xl bg-foreground px-3 py-1 text-sm font-bold text-background after:absolute after:right-full after:top-1/2 after:-translate-y-1/2 after:border-[6px] after:border-transparent after:border-r-foreground">
                  Start
                </span>
              )}
              <Link
                href={`/lesson?topic=${s.key}`}
                aria-label={`${s.label}${s.next ? ", recommended next" : s.state === "strong" ? ", spotted well" : ""}`}
                className={`stop grid place-items-center rounded-full ${look.cls}`}
                style={{ "--edge": look.edge } as React.CSSProperties}
              >
                {s.state === "strong" && !s.next ? <Check className="size-8" strokeWidth={3} aria-hidden /> : <Icon className="size-8" aria-hidden />}
              </Link>
              <span className="mt-3 rounded-md bg-background px-1.5 text-center text-sm font-semibold leading-tight">{s.label}</span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
