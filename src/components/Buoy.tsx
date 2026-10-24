"use client";
// Buoy: Hookline's own guide, a lifebuoy with a face. Three moods.
import { motion } from "motion/react";

export type Mood = "idle" | "happy" | "hmm" | "cheer";

export default function Buoy({ mood = "idle", size = 72 }: { mood?: Mood; size?: number }) {
  const mouth =
    mood === "happy" || mood === "cheer" ? "M38 60 Q50 72 62 60" : mood === "hmm" ? "M40 64 Q50 58 60 64" : "M40 62 Q50 66 60 62";
  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      key={mood}
      initial={{ scale: 0.85, rotate: mood === "hmm" ? -6 : 0 }}
      animate={mood === "cheer" ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] } : { scale: 1, rotate: mood === "hmm" ? -6 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 14, ...(mood === "cheer" ? { repeat: 2, duration: 0.6 } : {}) }}
    >
      {/* ring with four navy bands */}
      <circle cx="50" cy="50" r="40" fill="#ffb840" stroke="#000000" strokeWidth="4" />
      {[0, 90, 180, 270].map((a) => (
        <path key={a} d="M50 10 A40 40 0 0 1 78 22 L66 34 A22 22 0 0 0 50 28 Z" fill="#000000" transform={`rotate(${a + 20} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="22" fill="#ffffff" stroke="#000000" strokeWidth="4" />
      {/* face */}
      {mood === "cheer" ? (
        <>
          <path d="M40 46 Q43 42 46 46" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M54 46 Q57 42 60 46" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="43" cy="46" r="3" fill="#000000" />
          <circle cx="57" cy="46" r="3" fill="#000000" />
        </>
      )}
      <path d={mouth} stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" transform="translate(0 -6)" />
    </motion.svg>
  );
}

export function BuoyTip({ mood, children }: { mood: Mood; children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-3">
      <div className="shrink-0"><Buoy mood={mood} size={64} /></div>
      <motion.p
        key={String(children)}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-2 rounded-2xl rounded-bl-sm border border-line bg-card px-4 py-2 text-[0.95rem] leading-snug border border-line"
      >
        {children}
      </motion.p>
    </div>
  );
}
