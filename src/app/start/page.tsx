"use client";
import { useState } from "react";
import Quiz, { type Item } from "@/components/Quiz";
import seedLessons from "@/data/seed-lessons.json";
import type { Question } from "@/lib/schemas";

const AGES = [
  ["under-35", "Under 35"],
  ["35-64", "35 to 64"],
  ["65+", "65 or over"],
  ["skip", "Rather not say"],
] as const;
const SERVICES = [
  ["online_banking", "Online banking"],
  ["parcels", "Parcel deliveries"],
  ["marketplace", "Buying or selling online"],
  ["dating", "Dating apps"],
  ["crypto", "Crypto or investing"],
  ["job_hunting", "Looking for work"],
] as const;

// Starting quiz: one question from each of five common scam types.
const START = ["delivery_fee", "bank_impersonation", "family_emergency", "account_takeover_code", "marketplace_purchase"];
const lessons = seedLessons as Record<string, { quiz: Question[] }>;
const items: Item[] = START.map((c) => {
  const q = Math.max(0, lessons[c].quiz.findIndex((x) => x.kind !== "mc"));
  return { lessonId: `seed:${c}`, q, question: lessons[c].quiz[q] };
});

export default function Start() {
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("skip");
  const [services, setServices] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  if (started) return <Quiz items={items} title="Starting check: 5 quick questions" finishLabel="Back to home" next={{ href: "/sign-up", label: "Sign up to save your progress" }} />;

  async function go(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/session", { method: "POST", body: JSON.stringify({ nickname: name, age_band: age, services }) });
    if (r.ok) setStarted(true);
    else setError((await r.json()).error ?? "Something went wrong. Try again.");
  }

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <h1 className="text-[2rem] font-semibold tracking-tight leading-tight">Let's set you up</h1>
      <p className="mt-2 text-lg text-ink-soft">Three questions, then a quick check of what you already spot.</p>
      <form onSubmit={go} className="mt-8 space-y-8">
        <label className="block">
          <span className="text-lg font-bold">What should we call you?</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="nickname"
            className="mt-2 block w-full rounded-2xl border-2 border-line bg-card px-4 py-4 text-lg focus:border-tide"
            placeholder="A first name or nickname"
          />
        </label>
        <fieldset>
          <legend className="text-lg font-bold">Your age</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {AGES.map(([v, l]) => (
              <button type="button" key={v} aria-pressed={age === v} onClick={() => setAge(v)}
                className={`rounded-2xl border-2 px-3 py-4 font-bold ${age === v ? "border-tide bg-accent" : "border-line bg-card"}`}>
                {l}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-lg font-bold">What do you use? <span className="font-normal text-ink-soft">Pick any</span></legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SERVICES.map(([v, l]) => {
              const on = services.includes(v);
              return (
                <button type="button" key={v} aria-pressed={on} onClick={() => setServices((s) => (on ? s.filter((x) => x !== v) : [...s, v]))}
                  className={`rounded-full border-2 px-4 py-3 font-bold ${on ? "border-tide bg-accent" : "border-line bg-card"}`}>
                  {l}
                </button>
              );
            })}
          </div>
        </fieldset>
        {error && <p role="alert" className="font-bold text-alarm">{error}</p>}
        <button disabled={!name.trim()} className="btn-chunky w-full bg-tide text-lg text-white">Continue</button>
        <p className="text-sm text-ink-soft">We only keep your nickname and these answers. Never your email, bank or card details.</p>
      </form>
    </main>
  );
}
