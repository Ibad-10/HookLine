import { expect, test, vi } from "vitest";
let cookie: string | undefined;
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => (cookie ? { value: cookie } : undefined) }) }));
import { createLearner, requireLearner } from "./learner";

test("I2: only a learner that exists in the database counts as signed in", async () => {
  cookie = undefined;
  expect(await requireLearner()).toBeNull();
  cookie = "made-up-id";
  expect(await requireLearner()).toBeNull();
  cookie = await createLearner({ nickname: "Sam", age_band: "skip", services: [] });
  expect(await requireLearner()).toBe(cookie);
});

test("I2: the comparison run needs the admin key", async () => {
  const { adminOk } = await import("./learner");
  expect(adminOk(new Request("http://x", { headers: { "x-admin-key": "k" } }), "k")).toBe(true);
  expect(adminOk(new Request("http://x"), "k")).toBe(false);
  expect(adminOk(new Request("http://x", { headers: { "x-admin-key": "" } }), "")).toBe(false);
});
