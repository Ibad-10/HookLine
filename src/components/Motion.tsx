"use client";
import { MotionConfig } from "motion/react";

// Honour the device's reduced-motion setting for every animation.
export default function Motion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
