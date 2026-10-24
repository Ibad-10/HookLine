import { expect, test } from "vitest";
import { checkBrands } from "./brands";

test("real brand names fail", () => {
  expect(checkBrands("Call from Barclays fraud team").ok).toBe(false);
  expect(checkBrands("Your HMRC refund").found).toEqual(["hmrc"]);
});

test("fictional brands and plain words pass", () => {
  expect(checkBrands("Call from Northgate Bank").ok).toBe(true);
  expect(checkBrands("an apple a day, chase the sky").ok).toBe(true);
});
