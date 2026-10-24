"use client";
// The scam text types itself out word by word, then the highlighter marks the trick.
import { motion } from "motion/react";

const BEFORE = "“Your parcel is waiting. Pay a".split(" ");
const FLAG = "£1.45 fee within 30 minutes";
const AFTER = "or it goes back.”".split(" ");

export default function HeroQuote() {
  const word = (w: string, i: number) => (
    <motion.span key={i} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ delay: 0.08 * i, duration: 0.3 }}>
      {w}{" "}
    </motion.span>
  );
  const flagAt = BEFORE.length;
  return (
    <p className="text-xl leading-relaxed text-white/90" aria-label={`${BEFORE.join(" ")} ${FLAG} ${AFTER.join(" ")}`}>
      <span aria-hidden>
        {BEFORE.map(word)}
        <motion.span
          className="rounded-[3px] px-0.5 text-navy"
          style={{ backgroundImage: "linear-gradient(var(--mark), var(--mark))", backgroundRepeat: "no-repeat" }}
          initial={{ backgroundSize: "0% 100%", color: "rgba(255,255,255,0.9)" }}
          animate={{ backgroundSize: "100% 100%", color: "#13223b" }}
          transition={{ delay: 0.08 * (flagAt + AFTER.length) + 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {FLAG}
        </motion.span>{" "}
        {AFTER.map((w, i) => word(w, flagAt + 1 + i))}
      </span>
    </p>
  );
}
