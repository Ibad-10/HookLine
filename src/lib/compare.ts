// "With vs without Mubit": numbers measured from our own call log, per arm.
import { estimateCarbon, type Range } from "./carbon";
import type { Arm, TaskName } from "./llm";

// USD per 1M tokens. Set 24 Oct 2026 from Anthropic's price list and third-party
// trackers (gpt-oss-20b on Groq: computeprices.com, updated 3 Aug 2026). Recheck before quoting.
export const PRICES: Record<string, { in: number; out: number }> = {
  "claude-haiku-4-5": { in: 1.0, out: 5.0 },
  "gpt-6-luna": { in: 0.1, out: 0.5 },
  "openai/gpt-oss-20b": { in: 0.075, out: 0.3 },
};

export type CallRow = {
  task: string; arm: string; model: string; request_id: string | null;
  in_tok: number; out_tok: number; ms: number; ttft_ms: number; ok: number; checks: string;
};

export type ArmSummary = {
  n: number; model: string; costPer1k: number | null; p50: number; p95: number; ttftP50: number; tokPerSec: number;
  inTokAvg: number; outTokAvg: number; schemaRate: number; brandRate: number; keyRate: number; okRate: number; errorRate: number;
  carbon: Range; requestIds: string[];
};

export function costOf(model: string, inTok: number, outTok: number): number | null {
  const p = PRICES[model];
  return p ? (inTok * p.in + outTok * p.out) / 1_000_000 : null;
}

const pct = (xs: number[], p: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)] : 0;
};
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function summarize(rows: CallRow[], task: TaskName): Record<string, ArmSummary> {
  const out: Record<string, ArmSummary> = {};
  for (const arm of ["plain", "stuffed", "small"] as Arm[]) {
    const all = rows.filter((r) => r.task === task && r.arm === arm);
    // Provider errors (rate limits, outages) are not the model's output quality: count them apart.
    const rs = all.filter((r) => !JSON.parse(r.checks || "{}").error);
    if (!all.length) continue;
    if (!rs.length) {
      const none = { low: 0, central: 0, high: 0 };
      out[arm] = { n: 0, model: all[all.length - 1].model, costPer1k: null, p50: 0, p95: 0, ttftP50: 0, tokPerSec: 0, inTokAvg: 0,
        outTokAvg: 0, schemaRate: 0, brandRate: 0, keyRate: 0, okRate: 0, errorRate: 1, carbon: none, requestIds: [] };
      continue;
    }
    const checks = rs.map((r) => JSON.parse(r.checks || "{}") as Record<string, boolean>);
    const rate = (k: string) => checks.filter((c) => c.schema && c[k] !== false).length / rs.length;
    const model = rs[rs.length - 1].model;
    const inTokAvg = avg(rs.map((r) => r.in_tok)), outTokAvg = avg(rs.map((r) => r.out_tok));
    const unit = costOf(model, inTokAvg, outTokAvg);
    out[arm] = {
      n: rs.length,
      model,
      // Don't quote a cost from a handful of calls or from output that never passed.
      costPer1k: unit === null || rs.length < 5 || !rs.some((r) => r.ok) ? null : unit * 1000,
      p50: pct(rs.map((r) => r.ms), 0.5),
      p95: pct(rs.map((r) => r.ms), 0.95),
      ttftP50: pct(rs.map((r) => r.ttft_ms), 0.5),
      // Models that send the whole answer at once have no stream to time, so use total time.
      tokPerSec: avg(rs.filter((r) => r.ms > 0).map((r) => r.out_tok / (Math.max(r.ms - r.ttft_ms, r.ms * 0.2) / 1000))),
      inTokAvg,
      outTokAvg,
      schemaRate: rate("schema"),
      brandRate: checks.some((c) => "info_brands_raw" in c) ? rate("info_brands_raw") : rate("brands"),
      keyRate: rate("answer_key"),
      okRate: rs.filter((r) => r.ok).length / rs.length,
      errorRate: (all.length - rs.length) / all.length,
      carbon: estimateCarbon({ inTok: inTokAvg, outTok: outTokAvg, size: arm === "small" ? "small" : "frontier" }),
      requestIds: rs.map((r) => r.request_id).filter((x): x is string => !!x).slice(-5),
    };
  }
  return out;
}

export function project(perCallCost: number, users: number, lessonsPerUserMonth = 30): number {
  return perCallCost * users * lessonsPerUserMonth;
}
