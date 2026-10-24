import { expect, test } from "vitest";
import { gate, luhn, normalizeSpoken } from "./gatekeeper";

test("card number with spaces stops and is masked", () => {
  const r = gate("my card is 4111 1111 1111 1111", null);
  expect(r.stop).toBe(true);
  expect(r.kinds).toContain("card");
  expect(r.masked).not.toMatch(/\d{4}/);
});

test("card number read out as words stops", () => {
  const r = gate("four one one one one one one one one one one one one one one one", null);
  expect(r.stop).toBe(true);
  expect(r.kinds).toContain("card");
});

test("16 digits failing Luhn are not a card", () => {
  expect(luhn("1234567890123456")).toBe(false);
  expect(gate("1234 5678 9012 3456", null).kinds).not.toContain("card");
});

test("bank details", () => {
  expect(gate("sort code 12-34-56", null).kinds).toContain("bank");
  expect(gate("account 12345678", null).kinds).toContain("bank");
});

test("one-time codes, but not ages", () => {
  expect(gate("the code is 482913", null).kinds).toContain("code");
  expect(gate("I am 72 years old", null).stop).toBe(false);
});

test("password phrase", () => {
  const r = gate("my password is fluffy cat", null);
  expect(r.kinds).toContain("password");
  expect(r.masked).not.toContain("fluffy");
});

test("context rule after the caller asks for a secret", () => {
  expect(gate("it's bluebird", "password").stop).toBe(true);
  expect(gate("who is calling?", "password").stop).toBe(false);
  expect(gate("no, I'll call my bank", "code").stop).toBe(false);
});

test("spoken digits are normalised", () => {
  expect(normalizeSpoken("four eight two nine one three")).toContain("482913");
  expect(normalizeSpoken("4 8 2-9 1 3")).toContain("482913");
});

test("ordinary talk passes", () => {
  expect(gate("hello, who is this please", null).stop).toBe(false);
});

test("context rule: bare assent or stalling is not giving the secret", () => {
  expect(gate("ok", "code").stop).toBe(false);
  expect(gate("yes sure", "card").stop).toBe(false);
  expect(gate("hold on a moment", "code").stop).toBe(false);
  expect(gate("ok it's 4 8 2 9 1 3", "code").stop).toBe(true);
});
