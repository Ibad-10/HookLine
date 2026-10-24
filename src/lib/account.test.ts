import { expect, test } from "vitest";
import { resolveLearner } from "./account";
import { createLearner, getLearner } from "./learner";

test("signed-out visitor with a guest cookie stays the guest", async () => {
  const guest = await createLearner({ nickname: "Guest", age_band: "skip", services: [] });
  expect(await resolveLearner(null, guest, "x")).toBe(guest);
});

test("signing up claims the guest's progress", async () => {
  const guest = await createLearner({ nickname: "Guest", age_band: "skip", services: [] });
  expect(await resolveLearner("user_1", guest, "Pat")).toBe(guest);
  expect((await getLearner(guest))?.clerk_user_id).toBe("user_1");
});

test("a signed-in user always gets their own learner, never someone else's guest", async () => {
  const other = await createLearner({ nickname: "Other", age_band: "skip", services: [] });
  await resolveLearner("user_2", other, "A");
  const id = await resolveLearner("user_3", other, "B"); // other is already claimed by user_2
  expect(id).not.toBe(other);
  expect(await resolveLearner("user_3", null, "B")).toBe(id);
});

test("signed-in user with no guest gets a new learner named from their account", async () => {
  const id = await resolveLearner("user_4", null, "Sam");
  expect((await getLearner(id!))?.nickname).toBe("Sam");
});

test("nobody signed in and no cookie means no learner", async () => {
  expect(await resolveLearner(null, null, "")).toBeNull();
});
