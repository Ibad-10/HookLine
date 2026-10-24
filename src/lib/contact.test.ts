import { expect, test } from "vitest";
import { ContactPrefs, applyPrefs, defaultPrefs } from "./contact";

test("opting in records when, opting out clears the number", () => {
  const now = Date.UTC(2026, 9, 24, 20);
  let p = applyPrefs(defaultPrefs(), { reminders: true, reminderTime: "18:30", phone: { on: true, number: "+44 7700 900123" }, email: { on: true } }, now);
  expect(p.phone.at).toBe(now);
  expect(p.email.at).toBe(now);
  expect(p.phone.number).toBe("+447700900123");
  p = applyPrefs(p, { ...p, phone: { on: false, number: "" } }, now + 1);
  expect(p.phone).toEqual({ on: false, number: "", at: null, verified: false });
  expect(p.email.at).toBe(now); // unchanged opt-in keeps its original date
});

test("bad phone numbers and times are refused", () => {
  expect(ContactPrefs.safeParse({ reminders: true, reminderTime: "25:00", phone: { on: false, number: "" }, email: { on: false } }).success).toBe(false);
  expect(ContactPrefs.safeParse({ reminders: false, reminderTime: "18:00", phone: { on: true, number: "call me" }, email: { on: false } }).success).toBe(false);
  expect(ContactPrefs.safeParse({ reminders: false, reminderTime: "18:00", phone: { on: true, number: "+44 7700 900123" }, email: { on: false } }).success).toBe(true);
});

test("a verified number stays verified only while unchanged", () => {
  const now = 1;
  const base = applyPrefs(defaultPrefs(), { reminders: false, reminderTime: "18:00", phone: { on: true, number: "+447700900123" }, email: { on: false } }, now);
  expect(base.phone.verified).toBe(false);
  const ok = { ...base, phone: { ...base.phone, verified: true } };
  const same = { reminders: false, reminderTime: "18:00", phone: { on: true, number: "+44 7700 900123" }, email: { on: false } };
  expect(applyPrefs(ok, same, 2).phone.verified).toBe(true);
  expect(applyPrefs(ok, { ...same, phone: { on: true, number: "+447700900999" } }, 2).phone.verified).toBe(false);
});
