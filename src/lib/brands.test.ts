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

test("government bodies and agencies count as real names too", () => {
  expect(checkBrands("When 'The FTC' calls").ok).toBe(false);
  expect(checkBrands("Action Fraud and the FBI").ok).toBe(false);
});

test("scrub swaps real names for made-up ones by kind", async () => {
  const { scrubBrands } = await import("./brands");
  const out = scrubBrands("When the FTC calls about your Barclays card and a Royal Mail parcel");
  expect(checkBrands(out).ok).toBe(true);
  expect(out).toContain("Northgate Bank");
  expect(out).toContain("SwiftParcel");
});

test("I4: brand names inside web addresses and in capitals are caught and rewritten", async () => {
  const { scrubBrands } = await import("./brands");
  for (const t of ["Visit paypal-secure.com", "royalmail.com/redeliver", "www.amazon.co.uk", "PAYPAL alert"]) {
    expect(checkBrands(t).ok, t).toBe(false);
    expect(checkBrands(scrubBrands(t)).ok, scrubBrands(t)).toBe(true);
  }
  expect(scrubBrands("Chase Bank")).toBe("Northgate Bank");
});
