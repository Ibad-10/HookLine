"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RunCompare() {
  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const [key, setKey] = useState("");
  const router = useRouter();
  async function run() {
    setState("running");
    const r = await fetch("/api/compare", { method: "POST", headers: { "x-admin-key": key } }).catch(() => null);
    setState(r?.ok ? "idle" : "error");
    router.refresh();
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="admin-key">Admin key</label>
      <input id="admin-key" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin key"
        className="min-h-12 w-40 rounded-xl bg-white/10 px-3 text-white placeholder:text-white/60" />
      <button type="button" onClick={run} disabled={state === "running" || !key}
        className="btn-chunky bg-mark text-navy" style={{ "--btn-edge": "#c9a900" } as React.CSSProperties}>
        {state === "running" ? "Running 30 calls, about a minute…" : "Run the comparison again"}
      </button>
      {state === "error" && <span role="alert" className="font-bold text-mark">The run didn't finish. Check the admin key and try again.</span>}
    </div>
  );
}
