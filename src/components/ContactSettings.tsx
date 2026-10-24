"use client";
// Reminders and opt-in to practice by phone or email (Settings).
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { Stored } from "@/lib/contact";

export default function ContactSettings() {
  const [p, setP] = useState<Stored | null>(null);
  const [number, setNumber] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/contact").then((r) => (r.ok ? r.json() : null)).then((v: Stored | null) => {
      if (v) { setP(v); setNumber(v.phone.number); }
    });
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
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={number} onChange={(e) => setNumber(e.target.value)}
              placeholder="+44 7700 900123" className="h-12 min-w-0 flex-1 rounded-xl bg-secondary px-3 text-lg" />
            <button className="rounded-full bg-foreground px-5 font-semibold text-background">Save</button>
          </form>
        )}
      </div>

      <label className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 ring-1 ring-line">
        <span>
          <span className="block font-semibold">Practice emails</span>
          <span className="block text-ink-soft">Pretend scam emails to your account address, from Hookline’s published domain.{since(p.email.at)}</span>
        </span>
        <Switch checked={p.email.on} onCheckedChange={(v) => save({ ...p, email: { on: Boolean(v) } })} />
      </label>

      <p className="text-sm text-ink-soft">
        Coming soon: reminders and real phone and email practice aren’t sent yet. We’ll confirm your number or address before the first one, and you can turn any of these off at any time.
      </p>
      {msg && <p role="status" className="text-sm font-medium">{msg}</p>}
    </section>
  );
}
