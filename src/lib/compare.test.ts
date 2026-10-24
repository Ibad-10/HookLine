import { expect, test } from "vitest";
import { PRICES, costOf, project, summarize, type ArmSummary, type CallRow } from "./compare";

const row = (arm: string, ms: number, ok = 1, checks = { schema: true, brands: true, answer_key: true }): CallRow => ({
  task: "teacher", arm, model: arm === "small" ? "openai/gpt-oss-20b" : "claude-haiku-4-5", request_id: `mreq_${ms}`,
  in_tok: 1000, out_tok: 1000, ms, ttft_ms: ms / 10, ok, checks: JSON.stringify(checks),
});

test("cost per call from the price table", () => {
  expect(costOf("claude-haiku-4-5", 1_000_000, 1_000_000)).toBeCloseTo(PRICES["claude-haiku-4-5"].in + PRICES["claude-haiku-4-5"].out);
  expect(costOf("unknown-model", 1, 1)).toBeNull();
});

test("summary per arm: percentiles, rates, cost per 1,000", () => {
  const rows = [100, 200, 300, 400, 1000].map((ms) => row("plain", ms))
    .concat([row("small", 50), row("small", 60, 0, { schema: false, brands: true, answer_key: true })]);
  const s = summarize(rows, "teacher") as Record<"plain" | "small", ArmSummary>;
  expect(s.plain.n).toBe(5);
  expect(s.plain.p50).toBe(300);
  expect(s.plain.p95).toBe(1000);
  expect(s.small.schemaRate).toBe(0.5);
  expect(s.plain.costPer1k).toBeCloseTo(1000 * costOf("claude-haiku-4-5", 1000, 1000)!);
  expect(s.plain.carbon.central).toBeGreaterThan(s.small.carbon.central);
  expect(s.plain.requestIds).toContain("mreq_100");
});

test("projection: users x lessons per month x cost per lesson", () => {
  expect(project(0.001, 1_000_000)).toBe(30_000);
});

test("an arm whose calls all errored is shown, with no cost to project", () => {
  const err = { ...row("small", 10), checks: JSON.stringify({ error: true }), ok: 0 };
  const s = summarize([err, err], "teacher");
  expect(s.small.n).toBe(0);
  expect(s.small.errorRate).toBe(1);
  expect(s.small.costPer1k).toBeNull();
});

test("cost is not quoted from fewer than 5 good calls", () => {
  const s = summarize([row("small", 10), row("small", 20)], "teacher");
  expect(s.small.costPer1k).toBeNull();
});
