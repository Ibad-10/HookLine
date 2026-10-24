"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SCENARIOS } from "@/lib/call/scenarios";
import type { CallState } from "@/lib/call/types";
import { LABELS } from "@/lib/taxonomy";

const HEAD = {
  pass: { title: "You kept your money safe", body: "Hanging up, asking questions or checking if it's real is exactly what works on a real call." },
  stopped: { title: "We stopped the call to protect you", body: "It sounded like you were about to share real details. On a real call, that's the moment to hang up." },
  scammed: { title: "This one got through", body: "That's why we practise. Here's where the caller pulled you in, so you can spot it next time." },
};

export default function Debrief() {
  const [data, setData] = useState<{ state: CallState; scenarioId: string } | null>(null);
  const [next, setNext] = useState<{ id: string; title: string; why: string }[]>([]);
  useEffect(() => {
    const raw = sessionStorage.getItem("hl_last_call");
    if (!raw) return;
    const d = JSON.parse(raw) as { state: CallState; scenarioId: string };
    setData(d);
    const nodes = d.state.transcript.filter((t) => t.who === "caller" && t.node).map((t) => t.node!);
    // Suggest the next calls once this result is on the profile.
    fetch("/api/call/outcome", { method: "POST", body: JSON.stringify({ scenarioId: d.scenarioId, outcome: d.state.outcome, nodes }) })
      .then(() => fetch(`/api/call/suggest?exclude=${d.scenarioId}`))
      .then((r) => (r.ok ? r.json() : []))
      .then(setNext)
      .catch(() => undefined);
    sessionStorage.removeItem("hl_last_call");
  }, []);

  if (!data)
    return (
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">No call to review</h1>
        <Link href="/home" className="btn-chunky mt-6 grid place-items-center bg-tide text-white">Back to home</Link>
      </main>
    );

  const sc = SCENARIOS[data.scenarioId];
  const head = HEAD[data.state.outcome ?? "pass"];
  const steps = data.state.transcript.filter((t) => t.who === "caller" && t.node && !["truth", "end_safe", "end_scammed"].includes(t.node!));
  const firstAsk = steps.find((t) => sc.nodes[t.node!].ask);

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <p className="rounded-full bg-mark px-3 py-1 text-sm font-bold text-navy w-fit">Practice call review</p>
      <h1 className="mt-4 text-[2rem] font-semibold tracking-tight leading-tight">{head.title}</h1>
      <p className="mt-2 text-lg text-ink-soft">{head.body}</p>

      <h2 className="mt-8 text-xl font-semibold tracking-tight">The tricks the caller used</h2>
      <ol className="mt-3 space-y-3">
        {steps.map((t, k) => {
          const n = sc.nodes[t.node!];
          return (
            <li key={k} className={`rounded-2xl bg-card p-4 ${t === firstAsk ? "border-2 border-alarm" : ""}`}>
              <p className="font-bold">{(LABELS as Record<string, string>)[n.technique]}</p>
              <p className="mt-1 text-ink-soft">&ldquo;{t.text}&rdquo;</p>
              {t === firstAsk && <p className="mt-2 font-bold text-alarm">This was the moment to hang up: they asked for {n.ask === "money" ? "money" : `your ${n.ask}`}.</p>}
            </li>
          );
        })}
      </ol>

      <section className="mt-8 rounded-2xl bg-navy p-5 text-white">
        <h2 className="text-xl font-semibold tracking-tight">On a real call</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Hang up. Wait five minutes, or use a different phone.</li>
          <li>Call the number on the back of your card or on the company's own website.</li>
          <li>Your bank will never ask for a one-time code or ask you to move money to a &ldquo;safe account&rdquo;.</li>
        </ul>
      </section>
      {next.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">Your next call</h2>
          <Link href={`/call/${next[0].id}`} className="lift mt-3 block rounded-2xl bg-card p-4 ring-1 ring-line">
            <p className="font-bold">{next[0].title}</p>
            <p className="mt-1 text-ink-soft">{next[0].why}</p>
          </Link>
          <ul className="mt-3 space-y-2">
            {next.slice(1).map((c) => (
              <li key={c.id}>
                <Link href={`/call/${c.id}`} className="block rounded-xl px-4 py-3 ring-1 ring-line hover:bg-card">{c.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-6 grid gap-3">
        <Link href={`/call/${sc.id}`} className="btn-chunky grid place-items-center bg-tide text-white">Try this call again</Link>
        <Link href="/home" className="py-3 text-center font-bold text-tide">Back to home</Link>
      </div>
    </main>
  );
}
