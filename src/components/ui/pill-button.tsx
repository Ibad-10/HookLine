"use client";
// Pill buttons (Aceternity-style shimmer / moving-border, our own code).
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = { href: string; children: React.ReactNode; className?: string; variant?: "light" | "glow" | "ghost"; size?: "md" | "sm" };

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-[-0.01em] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-glow";

export function PillButton({ href, children, className, variant = "light", size = "md" }: Props) {
  const sizes = size === "sm" ? "h-10 whitespace-nowrap px-4 text-[0.95rem]" : "h-12 whitespace-nowrap px-6 text-base";
  const look =
    variant === "light"
      ? "bg-white text-black"
      : variant === "glow"
        ? "text-white bg-[linear-gradient(180deg,#1a8ff0,#0068ad)] shadow-[0_0_0_1px_rgba(122,202,255,0.4),0_8px_30px_-10px_rgba(0,153,255,0.8)]"
        : "text-white ring-1 ring-white/20 hover:bg-white/10";
  return (
    <motion.span whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="inline-flex">
      <Link href={href} className={cn(base, sizes, look, className)}>
        {variant !== "ghost" && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-[left,opacity] duration-700 group-hover:left-[120%] group-hover:opacity-100"
          />
        )}
        <span className="relative">{children}</span>
      </Link>
    </motion.span>
  );
}
