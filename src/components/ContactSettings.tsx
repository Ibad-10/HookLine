"use client";
// Reminders and opt-in to practice by phone or email (Settings).
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { Stored } from "@/lib/contact";

export default function ContactSettings() {
  const [p, setP] = useState<Stored | null>(null);
  const [number, setNumber] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [wait, setWait] = useState(0); // seconds before another code can be sent
  const [callWait, setCallWait] = useState(0); // seconds before another practice call
  useEffect(() => {
    if (callWait <= 0) return;
    const t = setTimeout(() => setCallWait(callWait - 1), 1000);
    return () => clearTimeout(t);
  }, [callWait]);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function verify(withCode?: string) {
    setBusy("verify");
    const r = await fetch("/api/phone/verify", { method: "POST", body: JSON.stringify(withCode ? { code: withCode } : {}) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && withCode) { setP(j); setCode(""); setCodeSent(false); setMsg("Number confirmed."); }
    else if (r?.ok) { setCodeSent(true); setWait(60); setMsg("Code sent. Check your texts."); }
    else setMsg(j.error ?? "That didn't work. Try again.");
    setBusy("");
  }

  async function trigger(kind: "phone" | "email") {
    setBusy(kind);
    const r = await fetch(kind === "phone" ? "/api/phone/call" : "/api/practice/email", { method: "POST" }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (kind === "phone" && (r?.ok || r?.status === 429)) setCallWait(300);
    setMsg(r?.ok ? (kind === "phone" ? "Calling your phone now. Answer it and practise." : `Practice email sent to ${j.to}. Check your inbox.`) : (j.error ?? "That didn't work. Try again."));
    setBusy("");
  }

  useEffect(() => {
    fetch("/api/contact").then((r) => (r.ok ? r.json() : null)).then((v: Stored | null) => {
      if (v) { setP(v); setNumber(v.phone.number); }
    });
    fetch("/api/phone/verify").then((r) => r.json()).then((v: { pending: boolean; wait: number }) => {
      if (v.pending) { setCodeSent(true); setWait(v.wait); }
    }).catch(() => undefined);
  }, []);

  async function save(next: Stored, phoneNumber = number) {
    setP(next);
    const r = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({ reminders: next.reminders, reminderTime: next.reminderTime, phone: { on: next.phone.on, number: phoneNumber }, email: { on: next.email.on } }),
    });
    const j = await r.json();
    if (r.ok) { setP(j); setMsg("Saved."); } else setMsg(j.error ?? "Couldn't save.");
  }

  if (!p) return <p className="text-ink-soft">Loading your choices…</p>;
  const since = (at: number | null) => (at ? ` You agreed on ${new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}.` : "");

  return (
    <section className="mt-8 space-y-3">
      <h2 className="text-2xl font-medium tracking-[-0.02em]">Reminders and <span className="font-serif font-light italic">practice</span></h2>
      <label className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 ring-1 ring-line">
        <span>
          <span className="block font-semibold">Daily reminder</span>
          <span className="block text-ink-soft">A gentle nudge to keep your streak.</span>
        </span>
        <Switch checked={p.reminders} onCheckedChange={(v) => save({ ...p, reminders: Boolean(v) })} />
      </label>
      {p.reminders && (
        <label className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 ring-1 ring-line">
          <span className="font-semibold">Remind me at</span>
          <input type="time" value={p.reminderTime} onChange={(e) => save({ ...p, reminderTime: e.target.value })}
            className="h-12 rounded-xl bg-secondary px-3 text-lg" />
        </label>
      )}

      <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-semibold">Practice calls to my phone</span>
            <span className="block text-ink-soft">A pretend scam call from Hookline’s published number, then a review.{since(p.phone.at)}</span>
          </span>
          <Switch checked={p.phone.on} onCheckedChange={(v) => save({ ...p, phone: { ...p.phone, on: Boolean(v) } })} />
        </label>
        {p.phone.on && (
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); save(p, number); }}>
            <label className="sr-only" htmlFor="phone">Phone number</label>
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={number} onChange={(e) => setNumber(e.target.value)} readOnly={codeSent}
              placeholder="+44 7700 900123" className="h-12 min-w-0 flex-1 rounded-xl bg-secondary px-3 text-lg" />
            {codeSent ? (
              <button type="button" onClick={() => { setCodeSent(false); setCode(""); }} className="rounded-full px-4 font-semibold underline">Change</button>
            ) : (
              <button className="rounded-full bg-foreground px-5 font-semibold text-background">Save</button>
            )}
          </form>
        )}
        {p.phone.on && p.phone.number && !p.phone.verified && (
          <div className="mt-3 space-y-2">
            <p className="text-ink-soft">Confirm this number is yours. We’ll text you a 6-digit code.</p>
            <button type="button" onClick={() => verify()} disabled={busy === "verify" || wait > 0} className="btn-chunky lift w-full bg-foreground text-background disabled:opacity-50">
              {busy === "verify" ? "Sending…" : wait > 0 ? `Text me a new code in ${wait}s` : codeSent ? "Text me a new code" : "Text me a code"}
            </button>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); verify(code); }}>
              <label className="sr-only" htmlFor="code">Code from the text</label>
              <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Code from the text" className="h-12 min-w-0 flex-1 rounded-xl bg-secondary px-3 text-lg tracking-widest" />
              <button disabled={busy === "verify" || code.length !== 6} className="rounded-full bg-foreground px-5 font-semibold text-background disabled:opacity-50">Confirm</button>
            </form>
          </div>
        )}
        {p.phone.on && !p.phone.verified && msg && <p role="status" className="mt-2 text-sm font-medium">{msg}</p>}
        {p.phone.on && p.phone.number && p.phone.verified && <p className="mt-3 font-medium text-ink-soft">✓ Number confirmed</p>}
        {p.phone.on && p.phone.number && p.phone.verified && (
          <button type="button" onClick={() => trigger("phone")} disabled={busy === "phone" || callWait > 0} className="btn-chunky btn-grad lift mt-3 w-full disabled:opacity-50">
            {busy === "phone" ? "Calling…" : callWait > 0 ? `Next practice call in ${Math.floor(callWait / 60)}:${String(callWait % 60).padStart(2, "0")}` : "Call me now"}
          </button>
        )}
      </div>

      <label className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 ring-1 ring-line">
        <span>
          <span className="block font-semibold">Practice emails</span>
          <span className="block text-ink-soft">Pretend scam emails to your account address, from Hookline’s published domain.{since(p.email.at)}</span>
        </span>
        <Switch checked={p.email.on} onCheckedChange={(v) => save({ ...p, email: { ...p.email, on: Boolean(v) } })} />
      </label>
      {p.email.on && (
        <button type="button" onClick={() => trigger("email")} disabled={busy === "email"} className="btn-chunky lift w-full bg-foreground text-background">
          {busy === "email" ? "Sending…" : "Send me a practice email"}
        </button>
      )}

      <p className="text-sm text-ink-soft">
        Practice calls and emails only go to you, from Hookline’s published number and address, and always say they’re practice. Reminders are coming soon. You can turn any of these off at any time.
      </p>
      {msg && <p role="status" className="text-sm font-medium">{msg}</p>}
    </section>
  );
}
