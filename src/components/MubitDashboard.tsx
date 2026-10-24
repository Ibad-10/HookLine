import Link from "next/link";
import adapterFile from "@/data/adapter-console.json";
import { GRID_G_PER_KWH } from "@/lib/carbon";
import { project, summarize, type ArmSummary, type CallRow } from "@/lib/compare";
import { db, migrate } from "@/lib/db";
import { modelFor, type Arm, type TaskName } from "@/lib/llm";
import { simulate } from "@/lib/sim";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RunCompare from "./RunCompare";

// Each model keeps one colour everywhere: frontier warm, small model cool.
const HUE: Record<Arm, string> = { plain: "#b5652a", stuffed: "#b5652a", small: "#4f5bd5" };

const ARMS: { arm: Arm; name: string; note: string }[] = [
  { arm: "plain", name: "Big model, no memory", note: "A frontier model writes every lesson. It knows nothing about the learner." },
  { arm: "stuffed", name: "Big model, profile pasted in", note: "The usual way to personalise: paste the learner's history into every prompt." },
  { arm: "small", name: "Small model (adapter size)", note: "What Mubit trains: a small model for this one job. Live numbers here use an untrained model of the same size." },
];

const money = (x: number | null) => (x === null ? "n/a" : x >= 100 ? `$${Math.round(x).toLocaleString()}` : `$${x.toFixed(x < 1 ? 3 : 2)}`);
const secs = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
const pctf = (x: number) => `${Math.round(x * 100)}%`;
const g = (x: number) => (x < 0.1 ? x.toFixed(3) : x.toFixed(2));

async function rows(): Promise<CallRow[]> {
  await migrate();
  const r = await db().execute("SELECT task, arm, model, request_id, in_tok, out_tok, ms, ttft_ms, ok, checks FROM calls");
  return r.rows.map((x) => ({ ...x }) as unknown as CallRow);
}

export type AdapterInfo = typeof adapterFile;

export async function readAdapterInfo(): Promise<AdapterInfo> {
  await migrate();
  const r = await db().execute("SELECT value FROM settings WHERE key = 'adapter_console'");
  return r.rows[0] ? (JSON.parse(String(r.rows[0].value)) as AdapterInfo) : adapterFile;
}

export default async function MubitDashboard({ admin = false }: { admin?: boolean }) {
  const adapter = await readAdapterInfo();
  const all = await rows();
  // Only rows from the models each arm uses now (older test rows used other models).
  const current = (task: TaskName) => all.filter((r) => r.model === modelFor(task, r.arm as Arm));
  const teacher = summarize(current("teacher"), "teacher");
  const coach = summarize(current("coach"), "coach");
  const sim = simulate({ users: 200, rounds: 20, seed: 1 });

  return (
    <div className="min-h-dvh">
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <Link href="/" className="text-sm font-bold text-white/80 hover:text-white">Back to Hookline</Link>
          <h1 className="mt-4 max-w-2xl text-[2.2rem] font-extrabold leading-tight">Same lesson, three ways to write it</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">
            Every AI call in Hookline goes through Mubit. Here we send the same inputs three ways and measure what each costs, how fast it is, and
            how often the output passes our checks. All numbers below come from real calls unless they say projected or estimated.
          </p>
          {admin && <div className="mt-5"><RunCompare /></div>}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-5 py-8">
        <Tabs defaultValue="teacher">
          <TabsList className="h-12">
            <TabsTrigger value="teacher" className="px-4 text-base">Writing a lesson</TabsTrigger>
            <TabsTrigger value="coach" className="px-4 text-base">Practice call turns</TabsTrigger>
          </TabsList>
          <TabsContent value="teacher"><Table title="Writing a lesson (Teacher)" s={teacher} /></TabsContent>
          <TabsContent value="coach"><Table title="Answering off-script on a practice call (Coach)" s={coach} coach /></TabsContent>
        </Tabs>

        <section>
          <h2 className="text-2xl font-extrabold">Projected monthly cost, one lesson a day per learner</h2>
          <p className="mt-1 text-ink-soft">Projected from the measured cost per lesson above. Not a quote.</p>
          <div className="mt-4 overflow-x-auto rounded-2xl bg-card">
            <table className="w-full min-w-[560px] text-left">
              <thead><tr className="border-b border-line">
                <th className="p-3">Learners</th>
                {ARMS.map((a) => <th key={a.arm} className="p-3">{a.name}</th>)}
              </tr></thead>
              <tbody>
                {[10_000, 100_000, 1_000_000].map((u) => (
                  <tr key={u} className="border-b border-line last:border-0">
                    <td className="p-3 font-bold">{u.toLocaleString()}</td>
                    {ARMS.map((a) => {
                      const c = teacher[a.arm]?.costPer1k;
                      return <td key={a.arm} className="p-3 tabular-nums">{c == null ? "n/a" : money(project(c / 1000, u))}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Growth plain={teacher.plain} stuffed={teacher.stuffed} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-card p-5">
            <h2 className="text-xl font-extrabold">Where the learner's profile goes</h2>
            <ul className="mt-3 space-y-2">
              <li><span className="font-bold">Big model, profile pasted in:</span> every call sends their history of mistakes to the model provider.</li>
              <li><span className="font-bold">Mubit adapter:</span> the model is trained for this one job and can run on infrastructure you control. The profile need not leave it.</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-card p-5">
            <h2 className="text-xl font-extrabold">Trained adapters (from the Mubit console)</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Mubit has no API for adapter results yet, so these are copied by hand{adapter.copied_at ? ` at ${adapter.copied_at}` : ""}.
            </p>
            {(["teacher", "coach"] as const).map((t) => (
              <p key={t} className="mt-3">
                <span className="font-bold">{t === "teacher" ? "Lesson writer" : "Call coach"}:</span> {adapter[t].status}
                {adapter[t].agreement_pct != null && `, matched the big model on ${adapter[t].agreement_pct}% of ${adapter[t].test_cases} test cases`}
                {adapter[t].kept_examples != null && ` (${adapter[t].kept_examples} kept examples)`}
              </p>
            ))}
          </div>
        </section>

        <SimChart sim={sim} />

        <section className="rounded-2xl bg-card p-5 text-ink-soft">
          <h2 className="text-lg font-extrabold text-ink">How we estimate carbon</h2>
          <p className="mt-2">
            We can't measure the energy a hosted AI model uses, so carbon is an estimate. We count the tokens each call uses and multiply by
            published energy-per-token figures (Google 2025, Epoch AI 2025, Jegham et al. 2025, ML.ENERGY) and an assumed grid intensity of{" "}
            {GRID_G_PER_KWH} g CO₂e per kWh. It covers running the model only, not training it or building the hardware. Figures set October 2026.
            Speed is measured from this server, median of all calls.
          </p>
        </section>
      </main>
    </div>
  );
}

const COACH_NOTES: Record<Arm, string> = {
  plain: "A frontier model reads the reply and picks the caller's next move.",
  stuffed: "Same, with the learner's history pasted into the prompt.",
  small: "A small model of adapter size picks the move. Untrained here.",
};

function Table({ title, s, coach }: { title: string; s: Record<string, ArmSummary>; coach?: boolean }) {
  const rowsDef: [string, (a: ArmSummary) => string][] = [
    ["Model", (a) => a.model],
    ["Calls measured", (a) => String(a.n)],
    ["Cost per 1,000", (a) => (a.costPer1k === null ? "n/a (under 5 good calls)" : money(a.costPer1k))],
    ["Time to finish (median)", (a) => secs(a.p50)],
    ["Time to finish (slowest 5%)", (a) => secs(a.p95)],
    ["Time to first word", (a) => secs(a.ttftP50)],
    ["Words out per second (tokens)", (a) => String(Math.round(a.tokPerSec))],
    ["Prompt size (tokens)", (a) => String(Math.round(a.inTokAvg))],
    ["Valid output", (a) => pctf(a.schemaRate)],
    ["Wrote no real company names (before our rewrite)", (a) => pctf(a.brandRate)],
    ["Answer key present", (a) => pctf(a.keyRate)],
    ["Passed every check", (a) => pctf(a.okRate)],
    ["Calls that errored (rate limit, outage)", (a) => pctf(a.errorRate)],
    ["Carbon per call, estimated", (a) => `${g(a.carbon.central)} g (${g(a.carbon.low)} to ${g(a.carbon.high)})`],
  ];
  return (
    <section>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-card">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-line align-bottom">
              <th className="p-3 w-56" />
              {ARMS.map((a) => (
                <th key={a.arm} className="p-3" style={{ borderTop: `4px solid ${HUE[a.arm]}` }}>
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: HUE[a.arm] }} />
                    {a.name}
                  </span>
                  <span className="block text-sm font-normal text-ink-soft">{coach ? COACH_NOTES[a.arm] : a.note}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsDef.map(([label, f]) => (
              <tr key={label} className="border-b border-line last:border-0">
                <th scope="row" className="p-3 font-bold">{label}</th>
                {ARMS.map((a) => (
                  <td key={a.arm} className="p-3 tabular-nums" title={s[a.arm]?.requestIds.join(", ")}>
                    {!s[a.arm] ? "No calls yet" : s[a.arm].n === 0 ? (label === "Model" ? s[a.arm].model : "All calls failed (rate limit)") : f(s[a.arm])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-ink-soft">Hover a value to see its Mubit request IDs, so any number can be traced in the console.</p>
    </section>
  );
}

function Growth({ plain, stuffed }: { plain?: ArmSummary; stuffed?: ArmSummary }) {
  if (!plain || !stuffed) return null;
  const extra = Math.max(0, stuffed.inTokAvg - plain.inTokAvg);
  const perLine = extra / 3; // the comparison run pastes 3 history lines
  return (
    <p className="mt-4 max-w-3xl">
      Pasting the profile in costs about <span className="font-bold">{Math.round(extra)} extra prompt tokens</span> per lesson today. That grows with
      every mistake a learner makes: after 200 recorded answers it would be roughly{" "}
      <span className="font-bold">{Math.round(perLine * 200).toLocaleString()} extra tokens</span> per lesson (estimated). A trained adapter carries
      what it learned in the model, not in the prompt.
    </p>
  );
}

function SimChart({ sim }: { sim: ReturnType<typeof simulate> }) {
  const counts = Array.from({ length: 10 }, (_, k) => sim.quizzesToFind.filter((q) => (k === 9 ? q >= 10 : q === k + 1)).length);
  const max = Math.max(...counts, 1);
  const sorted = [...sim.quizzesToFind].sort((a, b) => a - b);
  return (
    <section>
      <h2 className="text-2xl font-extrabold">Does the profile find what each person finds hard?</h2>
      <p className="mt-1 max-w-3xl text-ink-soft">
        200 simulated learners, each given 1 to 3 hidden weak spots in code. We count how many short sessions it takes before the profile ranks a
        hidden weak spot in its top three. This tests the profile, not whether people learn.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat value={pctf(sim.foundShare)} label="of hidden weak spots found" />
        <Stat value={String(sorted[sorted.length >> 1])} label="sessions needed, median" />
        <Stat value={pctf(sim.targetedShare)} label="of 'weak spot' lessons hit a real weak spot" />
      </div>
      <figure className="mt-6 rounded-2xl bg-card p-5">
        <figcaption className="font-bold">Sessions until a weak spot was found</figcaption>
        <div className="mt-4 flex h-48 items-end gap-2" role="img" aria-label="Bar chart of sessions until found; see the table below">
          {counts.map((c, k) => (
            <div key={k} className="group relative flex flex-1 flex-col items-center justify-end self-stretch">
              <span className="pointer-events-none absolute -top-7 hidden rounded bg-navy px-2 py-1 text-xs text-white group-hover:block">
                {c} weak spots
              </span>
              <div className="w-full rounded-t bg-tide" style={{ height: `${(c / max) * 100}%`, minHeight: c ? 4 : 0 }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2 text-center text-sm text-ink-soft">
          {counts.map((_, k) => <span key={k} className="flex-1">{k === 9 ? "10+" : k + 1}</span>)}
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-bold text-tide">Show as a table</summary>
          <table className="mt-2"><tbody>
            {counts.map((c, k) => (
              <tr key={k}><td className="pr-4">{k === 9 ? "10 or more" : k + 1} sessions</td><td className="tabular-nums">{c}</td></tr>
            ))}
          </tbody></table>
        </details>
      </figure>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-5">
      <p className="text-4xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-ink-soft">{label}</p>
    </div>
  );
}
