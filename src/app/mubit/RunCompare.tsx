"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RunCompare() {
  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const router = useRouter();
  async function run() {
    setState("running");
    const r = await fetch("/api/compare", { method: "POST" }).catch(() => null);
    setState(r?.ok ? "idle" : "error");
    router.refresh();
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={run} disabled={state === "running"}
        className="btn-chunky bg-mark text-navy" style={{ "--btn-edge": "#c9a900" } as React.CSSProperties}>
        {state === "running" ? "Running 30 calls, about a minute…" : "Run the comparison again"}
      </button>
      {state === "error" && <span role="alert" className="font-bold text-mark">The run didn't finish. Check the Mubit key and try again.</span>}
    </div>
  );
}
