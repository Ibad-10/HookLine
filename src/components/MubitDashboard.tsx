import Link from "next/link";
import Logo from "./Logo";
import adapterFile from "@/data/adapter-console.json";
import { GRID_G_PER_KWH } from "@/lib/carbon";
import { costOf, project, summarize, type ArmSummary, type CallRow } from "@/lib/compare";
import { db, migrate } from "@/lib/db";
import { modelFor, type Arm, type TaskName } from "@/lib/llm";
import { simulate } from "@/lib/sim";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RunCompare from "./RunCompare";
import ViewSwitch from "./ViewSwitch";

// Each model keeps one colour everywhere: frontier warm, small model cool.
const HUE: Record<Arm, string> = { plain: "#b5652a", stuffed: "#e0a274", small: "#4f5bd5" };

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
      {!admin && <nav aria-label="Main" className="glass sticky top-3 z-40 mx-auto mt-3 flex w-[calc(100%-2rem)] max-w-5xl items-center rounded-full px-3 py-1.5">
        <Link href="/"><Logo /></Link>
        <span className="ml-auto rounded-full bg-secondary px-3 py-1 text-sm font-medium">Our AI</span>
      </nav>}
      <header className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#0099ff]/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-5 pb-6 pt-12">
          <p className="w-fit rounded-full bg-mark px-3 py-1 text-sm font-semibold text-black">Every AI call goes through Mubit</p>
          <h1 className="mt-4 max-w-3xl text-[2.6rem] font-medium leading-[1.05] tracking-[-0.045em] md:text-[3.2rem]">
            How Hookline&rsquo;s AI <span className="font-serif font-light italic tracking-[-0.02em]">learns</span> and what it costs
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Nine AI jobs run the app. Each is a Mubit task that can train its own small model. Below: what each job costs, how fast it is, how often
            it passes our checks, and how close each small model is. All numbers come from real calls unless they say projected or estimated.
          </p>
          {admin && <div className="mt-5"><RunCompare /></div>}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-5 py-8">
        <TaskOverview rows={all} />
        <AdapterProgress adapter={adapter} />

        <Tabs defaultValue="teacher">
          <TabsList className="h-12">
            <TabsTrigger value="teacher" className="px-4 text-base">Writing a lesson</TabsTrigger>
            <TabsTrigger value="coach" className="px-4 text-base">Practice call turns</TabsTrigger>
          </TabsList>
          <TabsContent value="teacher"><Table title="Writing a lesson (Teacher)" s={teacher} /></TabsContent>
          <TabsContent value="coach"><Table title="Answering off-script on a practice call (Coach)" s={coach} coach /></TabsContent>
        </Tabs>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Projected monthly cost, one lesson a day per learner</h2>
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

        <section className="grid gap-4">
          <div className="rounded-2xl bg-card p-5">
            <h2 className="text-xl font-semibold tracking-tight">Where the learner's profile goes</h2>
            <ul className="mt-3 space-y-2">
              <li><span className="font-bold">Big model, profile pasted in:</span> every call sends their history of mistakes to the model provider.</li>
              <li><span className="font-bold">Mubit adapter:</span> the model is trained for this one job and can run on infrastructure you control. The profile need not leave it.</li>
            </ul>
          </div>
        </section>

        <SimChart sim={sim} />

        <section className="rounded-2xl bg-card p-5 text-ink-soft">
          <h2 className="text-lg font-semibold tracking-tight text-ink">How we estimate carbon</h2>
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
  const ok = (a?: ArmSummary) => (a && a.n > 0 ? a : undefined);
  const metric = (name: string, unit: string, val: (a: ArmSummary) => number | null, fmt: (v: number) => string) => {
    const vals = ARMS.map(({ arm }) => { const a = ok(s[arm]); return a ? val(a) : null; });
    const max = Math.max(...vals.map((v) => v ?? 0), 0.0001);
    return { name, unit, bars: ARMS.map(({ arm, name: armName }, i) => ({ arm, armName, v: vals[i], label: vals[i] === null ? "n/a" : fmt(vals[i]!), pct: vals[i] === null ? 0 : (vals[i]! / max) * 100 })) };
  };
  const groups = [
    { side: "Inputs: what each call sends", metrics: [
      metric("Prompt size", "tokens per call", (a) => a.inTokAvg, (v) => String(Math.round(v))),
    ] },
    { side: "Outputs: what each call gives back", metrics: [
      metric("Cost", "per 1,000 calls", (a) => a.costPer1k, money),
      metric("Time to finish", "median", (a) => a.p50, secs),
      metric("Passed every check", "share of calls", (a) => a.okRate * 100, (v) => `${Math.round(v)}%`),
      metric("Carbon, estimated", "g CO₂e per call", (a) => a.carbon.central, g),
    ] },
  ];
  const charts = (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map((grp) => (
        <section key={grp.side} className="rounded-2xl border border-line bg-card p-5">
          <h3 className="text-sm font-medium text-ink-soft">{grp.side}</h3>
          {grp.metrics.map((m) => (
            <figure key={m.name} className="mt-5">
              <figcaption className="text-lg font-medium">{m.name} <span className="font-normal text-ink-soft">({m.unit})</span></figcaption>
              {m.bars.map((b) => (
                <div key={b.arm} className="mt-2 grid grid-cols-[1fr_5.5rem] items-center gap-3">
                  <div className="h-6 overflow-hidden rounded-md bg-secondary">
                    <div className="h-full origin-left rounded-md transition-[width] duration-700" title={`${b.armName}: ${b.label}`}
                      style={{ width: `${Math.max(b.v === null ? 0 : 3, b.pct)}%`, background: HUE[b.arm] }} />
                  </div>
                  <span className="text-right tabular-nums">{b.label}</span>
                </div>
              ))}
            </figure>
          ))}
        </section>
      ))}
    </div>
  );
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {ARMS.map((a) => (
          <span key={a.arm} className="flex items-center gap-2"><span aria-hidden className="size-3 rounded-sm" style={{ background: HUE[a.arm] }} />{a.name}</span>
        ))}
      </div>
      <div className="mt-4">
      <ViewSwitch charts={charts} table={
      <div className="overflow-x-auto rounded-2xl bg-card">
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
      </div>} />
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
      <h2 className="text-2xl font-semibold tracking-tight">Does the profile find what each person finds hard?</h2>
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
      <p className="text-4xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-ink-soft">{label}</p>
    </div>
  );
}

// Every AI job in Hookline, one bar chart per measure. One series per chart, so the title names
// it; tasks keep the same order in every chart. Hover a bar for its exact value and model.
const TASKS: { task: string; label: string }[] = [
  { task: "teacher", label: "Writes lessons" },
  { task: "talker", label: "Live caller's words" },
  { task: "intent", label: "Labels your reply" },
  { task: "gatecheck", label: "Spots secrets being shared" },
  { task: "coach", label: "Call coach (first version)" },
  { task: "caller", label: "Writes calls for you" },
  { task: "mailer", label: "Writes practice emails" },
  { task: "learner", label: "Reads scam reports" },
  { task: "agent", label: "Phone voice agent turns" },
];

function TaskOverview({ rows }: { rows: CallRow[] }) {
  const stats = TASKS.map(({ task, label }) => {
    const rs = rows.filter((r) => r.task === task && !JSON.parse(r.checks || "{}").error);
    const ms = rs.map((r) => r.ms).sort((a, b) => a - b);
    const cost = rs.map((r) => costOf(r.model, r.in_tok, r.out_tok)).filter((c): c is number => c !== null);
    return {
      task,
      label,
      n: rs.length,
      model: rs.at(-1)?.model ?? "",
      p50: ms.length ? ms[ms.length >> 1] : null,
      cost: cost.length ? (cost.reduce((a, b) => a + b, 0) / cost.length) * 1000 : null,
      ok: rs.length ? rs.filter((r) => r.ok).length / rs.length : null,
    };
  }).filter((t) => t.n > 0);
  const charts: { name: string; unit: string; v: (t: (typeof stats)[number]) => number | null; fmt: (v: number) => string }[] = [
    { name: "Calls made", unit: "logged by the app", v: (t) => t.n, fmt: (v) => String(v) },
    { name: "Time to answer", unit: "median", v: (t) => (t.p50 === null ? null : t.p50 / 1000), fmt: (v) => `${v.toFixed(1)} s` },
    { name: "Cost", unit: "per 1,000 calls, USD", v: (t) => t.cost, fmt: money },
    { name: "Passed our checks", unit: "share of calls", v: (t) => (t.ok === null ? null : t.ok * 100), fmt: (v) => `${Math.round(v)}%` },
  ];
  const chartView = (
    <div className="grid gap-4 md:grid-cols-2">
      {charts.map((c) => {
        const max = Math.max(...stats.map((t) => c.v(t) ?? 0), 0.0001);
        return (
          <figure key={c.name} className="rounded-2xl border border-line bg-card p-5">
            <figcaption className="text-lg font-medium">
              {c.name} <span className="font-normal text-ink-soft">({c.unit})</span>
            </figcaption>
            <div className="mt-3 space-y-2">
              {stats.map((t) => {
                const v = c.v(t);
                const text = v === null ? "n/a" : c.fmt(v);
                return (
                  <div key={t.task} className="group relative grid grid-cols-[minmax(0,9.5rem)_1fr_4.5rem] items-center gap-3 text-sm">
                    <span className="truncate text-ink-soft" title={t.label}>{t.label}</span>
                    <div className="h-5 overflow-hidden rounded-[4px] bg-secondary">
                      <div className="h-full rounded-r-[4px] bg-tide" style={{ width: `${v === null ? 0 : Math.max(2, (v / max) * 100)}%` }} />
                    </div>
                    <span className="text-right tabular-nums">{text}</span>
                    <span role="tooltip" className="pointer-events-none absolute -top-8 left-1/3 z-10 hidden whitespace-nowrap rounded-md bg-navy px-2 py-1 text-xs text-white group-hover:block">
                      {t.label}: {text} ({t.model})
                    </span>
                  </div>
                );
              })}
            </div>
          </figure>
        );
      })}
    </div>
  );
  const tableView = (
    <div className="overflow-x-auto rounded-2xl bg-card">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-line">
            <th className="p-3">Task</th>
            <th className="p-3">Model</th>
            <th className="p-3">Calls</th>
            <th className="p-3">Median time</th>
            <th className="p-3">Cost per 1,000</th>
            <th className="p-3">Passed checks</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((t) => (
            <tr key={t.task} className="border-b border-line last:border-0">
              <th scope="row" className="p-3 font-bold">{t.label}</th>
              <td className="p-3">{t.model}</td>
              <td className="p-3 tabular-nums">{t.n}</td>
              <td className="p-3 tabular-nums">{t.p50 === null ? "n/a" : secs(t.p50)}</td>
              <td className="p-3 tabular-nums">{money(t.cost)}</td>
              <td className="p-3 tabular-nums">{t.ok === null ? "n/a" : pctf(t.ok)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">Every AI job in Hookline, all through Mubit</h2>
      <p className="mt-1 max-w-3xl text-ink-soft">
        Each job is its own Mubit task, so each can get its own small trained model (an adapter). Measured from the calls this app has made.
      </p>
      <div className="mt-4">
        <ViewSwitch charts={chartView} table={tableView} />
      </div>
    </section>
  );
}

type AdapterRow = { label?: string; status: string; kept_examples: number | null; agreement_pct: number | null; test_cases: number | null };

// How close each task's adapter is: kept examples against the 25 needed to train, and the
// share of the big model's answers matched against Mubit's 95% target (the dark tick).
function AdapterProgress({ adapter }: { adapter: AdapterInfo }) {
  const items = Object.entries(adapter).filter(([, v]) => typeof v === "object" && v !== null) as [string, AdapterRow][];
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">Small trained models (Mubit adapters)</h2>
      <p className="mt-1 max-w-3xl text-ink-soft">
        Mubit keeps good examples of each task and trains a small model once it has 25. A version goes live once it matches the big model on 95%
        of test cases. Copied by hand from the Mubit console{adapter.copied_at ? ` at ${adapter.copied_at}` : ""}, since Mubit has no API for
        these yet.
      </p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <span className="flex items-center gap-2"><span aria-hidden className="size-3 rounded-sm bg-tide" />Kept examples (of 25 needed)</span>
        <span className="flex items-center gap-2"><span aria-hidden className="size-3 rounded-sm" style={{ background: HUE.small }} />Matched the big model</span>
        <span className="flex items-center gap-2"><span aria-hidden className="h-3 w-0.5 bg-ink" />Target</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map(([key, a]) => (
          <figure key={key} className="rounded-2xl border border-line bg-card p-5">
            <figcaption className="text-lg font-medium">{a.label ?? key}</figcaption>
            <p className="text-sm text-ink-soft">{a.status}</p>
            <Bar label="Kept examples" value={Math.min(25, a.kept_examples ?? 0)} max={25} target={25} colour="#0068ad"
              text={a.kept_examples === null ? "not shown yet" : `${a.kept_examples} of 25`} />
            <Bar label="Matched big model" value={a.agreement_pct ?? 0} max={100} target={95} colour={HUE.small}
              text={a.agreement_pct === null ? "no version yet" : `${a.agreement_pct}% of ${a.test_cases} tests (needs 95%)`} />
          </figure>
        ))}
      </div>
    </section>
  );
}

function Bar({ label, value, max, target, colour, text }: { label: string; value: number; max: number; target: number; colour: string; text: string }) {
  return (
    <div className="mt-3" title={`${label}: ${text}`}>
      <div className="flex justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="text-right tabular-nums text-ink-soft">{text}</span>
      </div>
      <div className="relative mt-1 h-4 rounded-[4px] bg-secondary" role="img" aria-label={`${label}: ${text}`}>
        <div className="h-full rounded-[4px]" style={{ width: `${(value / max) * 100}%`, background: colour, minWidth: value ? 4 : 0 }} />
        <span aria-hidden className="absolute -top-1 h-6 w-0.5 bg-ink" style={{ left: `calc(${(target / max) * 100}% - 1px)` }} />
      </div>
    </div>
  );
}
