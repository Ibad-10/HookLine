"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdapterInfo } from "@/components/MubitDashboard";

export function RefreshNews() {
  const [state, setState] = useState("");
  const router = useRouter();
  async function run() {
    setState("Reading this week's reports…");
    const r = await fetch("/api/admin/ingest", { method: "POST" }).catch(() => null);
    const j = r?.ok ? await r.json() : null;
    setState(j ? `Added ${j.added} new report${j.added === 1 ? "" : "s"}.` : "Refresh didn't finish. Try again.");
    router.refresh();
  }
  return (
    <div className="flex items-center gap-3">
      <span role="status" className="text-sm text-ink-soft">{state}</span>
      <Button onClick={run} disabled={state.endsWith("…")} className="rounded-full px-5">Refresh news</Button>
    </div>
  );
}

type Task = AdapterInfo["teacher"];
const STATUSES = ["Collecting examples", "Reviewing examples", "Training", "Testing", "Passed", "Below target"];

export function AdapterForm({ initial }: { initial: AdapterInfo }) {
  const [form, setForm] = useState({ teacher: initial.teacher, coach: initial.coach });
  const [msg, setMsg] = useState("");
  const set = (t: "teacher" | "coach", k: keyof Task, v: string) =>
    setForm((f) => ({ ...f, [t]: { ...f[t], [k]: k === "status" ? v : v === "" ? null : Number(v) } }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/adapters", { method: "POST", body: JSON.stringify(form) });
    setMsg(r.ok ? "Saved. The dashboard now shows these numbers." : ((await r.json()).error ?? "Couldn't save."));
  }

  return (
    <form onSubmit={save} className="mt-6 grid gap-6 md:grid-cols-2">
      {(["teacher", "coach"] as const).map((t) => (
        <fieldset key={t} className="rounded-xl border border-line bg-card p-5">
          <legend className="px-1 text-lg font-medium">{t === "teacher" ? "Lesson writer" : "Call coach"}</legend>
          <label className="mt-2 block text-sm font-medium">Status
            <select value={form[t].status} onChange={(e) => set(t, "status", e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-line bg-background px-3">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          {([["kept_examples", "Kept examples"], ["agreement_pct", "Matched the big model (%)"], ["test_cases", "Test cases"]] as const).map(([k, label]) => (
            <label key={k} className="mt-3 block text-sm font-medium">{label}
              <input type="number" inputMode="decimal" min={0} value={form[t][k] ?? ""} onChange={(e) => set(t, k, e.target.value)}
                className="mt-1 block h-11 w-full rounded-lg border border-line bg-background px-3" />
            </label>
          ))}
        </fieldset>
      ))}
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" className="rounded-full px-6">Save adapter results</Button>
        <span role="status" className="text-sm text-ink-soft">{msg}</span>
      </div>
    </form>
  );
}
