// Every call script must be a complete, safe graph, or a call can dead-end or say a real brand.
import { existsSync } from "node:fs";
import { expect, test } from "vitest";
import { checkBrands } from "../brands";
import { CATEGORIES, TECHNIQUES } from "../taxonomy";
import { SCENARIOS } from "./scenarios";
import { checkScenario } from "./suggest";

for (const sc of Object.values(SCENARIOS)) {
  test(`${sc.id} is a complete, safe script with a clip for every line`, () => {
    expect(checkScenario(sc)).toEqual([]);
    expect(CATEGORIES).toContain(sc.category);
    for (const [id, n] of Object.entries(sc.nodes)) {
      expect(TECHNIQUES).toContain(n.technique);
      expect(checkBrands(n.line).found).toEqual([]);
      expect(existsSync(`public/audio/${sc.id}/${id}.mp3`), `clip ${sc.id}/${id}`).toBe(true);
    }
  });
}

test("the call that practises your weakest scam type comes first", async () => {
  const { suggestCalls } = await import("./suggest");
  const skills = [
    { key: "family_emergency", correct: 0, seen: 3, box: 1, due_at: 0 },
    { key: "bank_impersonation", correct: 4, seen: 4, box: 4, due_at: 0 },
  ];
  const order = suggestCalls(Object.values(SCENARIOS), skills).map((x) => x.sc.id);
  expect(order[0]).toBe("family-emergency");
  expect(order.at(-1)).toBe("safe-account");
});
