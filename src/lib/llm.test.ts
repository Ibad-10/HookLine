import { beforeAll, expect, test } from "vitest";
import { z } from "zod";
import { callLLM, type Complete } from "./llm";
import { estimateCarbon } from "./carbon";
import { db, migrate } from "./db";

beforeAll(() => migrate());

function fake(text: string): Complete {
  return async () => ({
    requestId: "mreq_test",
    stream: (async function* () {
      yield { choices: [{ delta: { content: text } }] };
      yield { choices: [], usage: { prompt_tokens: 10, completion_tokens: 5 } };
    })(),
  });
}

const base = { task: "teacher" as const, arm: "plain" as const, system: "s", user: "u", sessionId: "t" };

test("valid JSON is parsed, metered and logged", async () => {
  const r = await callLLM({ ...base, schema: z.object({ a: z.number() }), complete: fake('{"a":1}') });
  expect(r.ok).toBe(true);
  if (r.ok) expect(r.data.a).toBe(1);
  expect(r.meta.inTok).toBe(10);
  expect(r.meta.requestId).toBe("mreq_test");
  const rows = await db().execute("SELECT * FROM calls WHERE request_id = 'mreq_test' AND ok = 1");
  expect(rows.rows.length).toBeGreaterThan(0);
});

test("invalid output is a typed failure, logged with schema false", async () => {
  const r = await callLLM({ ...base, schema: z.object({ a: z.number() }), complete: fake("not json") });
  expect(r.ok).toBe(false);
  const rows = await db().execute("SELECT checks FROM calls WHERE ok = 0");
  expect(JSON.parse(String(rows.rows[0].checks)).schema).toBe(false);
});

test("JSON inside a code fence is accepted", async () => {
  const r = await callLLM({ ...base, schema: z.object({ a: z.number() }), complete: fake('```json\n{"a":2}\n```') });
  expect(r.ok).toBe(true);
});

test("network error is a typed failure, not a throw", async () => {
  const boom: Complete = async () => {
    throw new Error("down");
  };
  const r = await callLLM({ ...base, schema: z.object({}), complete: boom });
  expect(r.ok).toBe(false);
});

test("carbon estimate matches the worked example", () => {
  const f = estimateCarbon({ inTok: 300, outTok: 800, size: "frontier" });
  const s = estimateCarbon({ inTok: 300, outTok: 800, size: "small" });
  expect(f.central).toBeCloseTo(0.5, 1);
  expect(s.central / f.central).toBeCloseTo(0.1, 2);
  expect(f.low).toBeLessThan(f.central);
  expect(f.high).toBeGreaterThan(f.central);
});
