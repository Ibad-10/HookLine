"use client";
// Asks for a practice call written from the learner's weak spots, then opens it.
import { useState } from "react";

export default function MakeCall({ dark = false }: { dark?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function make() {
    setBusy(true);
    setMsg("");
    const r = await fetch("/api/call/generate", { method: "POST" }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && j.id) window.location.href = `/call/${j.id}`;
    else { setMsg(j.error ?? "That didn't work. Try again."); setBusy(false); }
  }
  return (
    <div>
      <button type="button" onClick={make} disabled={busy}
        className={`lift w-full rounded-full px-4 py-3 font-semibold disabled:opacity-60 ${dark ? "bg-white text-black" : "btn-chunky bg-foreground text-background"}`}>
        {busy ? "Writing a call for you…" : "Make me a new call from my weak spots"}
      </button>
      {msg && <p role="status" className={`mt-2 text-sm ${dark ? "text-white/70" : "text-ink-soft"}`}>{msg}</p>}
    </div>
  );
}
