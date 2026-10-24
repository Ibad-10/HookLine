"use client";
// Lesson path: one stop per scam type, winding down the page. The recommended
// next stop is bigger and says Start. Nothing is locked: any stop can be opened.
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

export default function PathMap({ stops }: { stops: Stop[] }) {
  return (
    <ol className="relative mx-auto flex max-w-xs flex-col items-center gap-9 py-2" aria-label="Your lesson path">
      {stops.map((s, i) => {
        const Icon = ICON[s.key] ?? Package;
        const x = Math.round(Math.sin(i * 1.1) * 70);
        return (
          <motion.li
            key={s.key}
            className="flex flex-col items-center"
            style={{ x }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/lesson?topic=${s.key}`}
              aria-label={`${s.label}${s.next ? ", recommended next" : ""}`}
              className={`relative grid place-items-center rounded-full transition-transform active:translate-y-1 ${
                s.next ? "size-20 bg-tide text-white shadow-[0_6px_0_var(--tide-dark)]"
                : s.state === "strong" ? "size-16 bg-mark text-navy shadow-[0_5px_0_#c9a900]"
                : s.state === "practising" ? "size-16 bg-card text-tide shadow-[0_5px_0_var(--line)] ring-4 ring-tide/30"
                : "size-16 bg-card text-ink-soft shadow-[0_5px_0_var(--line)]"
              }`}
            >
              {s.next && <span aria-hidden className="ring absolute inset-0 rounded-full bg-tide/40" />}
              {s.state === "strong" && !s.next ? <Check className="relative size-8" aria-hidden /> : <Icon className="relative size-8" aria-hidden />}
              {s.next && (
                <span className="absolute -top-9 whitespace-nowrap rounded-xl bg-navy px-3 py-1 text-sm font-extrabold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-navy">
                  Start
                </span>
              )}
            </Link>
            <span className="mt-2 max-w-36 text-center text-sm font-bold leading-tight">{s.label}</span>
          </motion.li>
        );
      })}
    </ol>
  );
}
