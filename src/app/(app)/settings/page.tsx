"use client";
import AppNav from "@/components/AppNav";
import Link from "next/link";
import ContactSettings from "@/components/ContactSettings";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

function readPrefs() {
  const v = document.cookie.match(/hl_prefs=([^;]*)/)?.[1] ?? "";
  return { large: v.includes("large"), slow: v.includes("slow"), mute: v.includes("mute"), dark: v.includes("dark") };
}

export default function Settings() {
  const [prefs, setPrefs] = useState({ large: false, slow: false, mute: false, dark: false });
  const [sly, setSly] = useState(true);
  useEffect(() => {
    setPrefs(readPrefs());
    try { setSly(localStorage.getItem("hl_sly") !== "off"); } catch {}
  }, []);

  async function save(next: typeof prefs) {
    setPrefs(next);
    document.documentElement.classList.toggle("large-text", next.large);
    await fetch("/api/prefs", { method: "POST", body: JSON.stringify(next) });
  }

  return (
    <>
    <AppNav />
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-[2.6rem] font-medium leading-none tracking-[-0.045em]">Settings</h1>
      <div className="mt-6 space-y-3">
        <Toggle label="Show Sly" hint="Hookline's cat mascot, in the corner of each screen." on={sly} onChange={(v) => { setSly(v); try { localStorage.setItem("hl_sly", v ? "on" : "off"); } catch {} window.dispatchEvent(new Event("sly-pref")); }} />
        <Toggle label="Larger text" hint="Makes every word on Hookline bigger." on={prefs.large} onChange={(v) => save({ ...prefs, large: v })} />
        <Toggle label="Slower voice on calls" hint="The caller speaks more slowly." on={prefs.slow} onChange={(v) => save({ ...prefs, slow: v })} />
        <Toggle label="Dark theme" hint="Light text on a black background." on={prefs.dark} onChange={(v) => { document.documentElement.classList.toggle("dark", v); save({ ...prefs, dark: v }); }} />
        <Toggle label="Mute lesson sounds" hint="No chimes when you answer." on={prefs.mute} onChange={(v) => save({ ...prefs, mute: v })} />
        <div className="rounded-2xl bg-card p-4">
          <p className="font-bold">Captions on calls</p>
          <p className="text-ink-soft">Always on, so you can read every word the caller says.</p>
        </div>
        <div className="rounded-2xl bg-card p-4">
          <p className="font-bold">Language</p>
          <p className="text-ink-soft">English. More languages are coming.</p>
        </div>
      </div>
      <ContactSettings />
      <p className="mt-8 text-sm text-ink-soft">
        Practice calls use a speech-to-text service, which hears your voice to turn it into words. Never say real card numbers, codes or passwords. Hookline masks
        them and never stores them.
      </p>
    </main>
    </>
  );
}

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl bg-card p-4">
      <span>
        <span className="block font-bold">{label}</span>
        <span className="block text-ink-soft">{hint}</span>
      </span>
      <Switch checked={on} onCheckedChange={(v) => onChange(Boolean(v))} className="scale-125" />
    </label>
  );
}
