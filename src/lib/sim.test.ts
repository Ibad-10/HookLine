import { expect, test } from "vitest";
import { simulate } from "./sim";

test("profile finds hidden weak spots quickly and deterministically", () => {
  const a = simulate({ users: 50, rounds: 20, seed: 1 });
  const b = simulate({ users: 50, rounds: 20, seed: 1 });
  expect(a).toEqual(b);
  expect(a.foundShare).toBeGreaterThan(0.9);
  const sorted = [...a.quizzesToFind].sort((x, y) => x - y);
  expect(sorted[Math.floor(sorted.length / 2)]).toBeLessThan(10);
  expect(a.targetedShare).toBeGreaterThan(0.5);
});
