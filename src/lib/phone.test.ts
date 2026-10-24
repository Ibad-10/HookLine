import { expect, test } from "vitest";
import { SCENARIOS } from "./call/scenarios";
import { firstTurn, nextTurn, twilioSignature, validTwilio } from "./phone";

const sc = SCENARIOS["safe-account"];
const base = "https://hookline.test";

test("Twilio signatures: valid passes, tampered fails", () => {
  const url = "https://hookline.test/api/phone/twiml?s=safe-account&node=open&l=abc";
  const params = { SpeechResult: "who is this", CallSid: "CA1" };
  const sig = twilioSignature("token", url, params);
  expect(validTwilio("token", url, params, sig)).toBe(true);
  expect(validTwilio("token", url, { ...params, SpeechResult: "x" }, sig)).toBe(false);
  expect(validTwilio("token", url, params, null)).toBe(false);
  expect(validTwilio("", url, params, sig)).toBe(false);
});

test("first turn says it is practice, then plays the opening clip and listens", () => {
  const x = firstTurn(base, sc, "l1");
  expect(x).toContain("Hookline practice call");
  expect(x).toContain("/audio/safe-account/open.mp3");
  expect(x).toContain('<Gather input="speech"');
});

test("reading out a code ends the call with no digits echoed", () => {
  const t = nextTurn(base, sc, "verify", "l1", "it's four eight two nine one three");
  expect(t.end).toBe("stopped");
  expect(t.twiml).toContain("<Hangup/>");
  expect(t.masked).not.toMatch(/\d{4}/);
});

test("asking who it is moves on; hanging up passes; off-script asks the coach", () => {
  expect(nextTurn(base, sc, "open", "l1", "who is this?").node).toBe("identity");
  expect(nextTurn(base, sc, "open", "l1", "I'm going to hang up").end).toBe("pass");
  expect(nextTurn(base, sc, "open", "l1", "the weather is nice").needCoach).toBe(true);
  expect(nextTurn(base, sc, "open", "l1", "the weather is nice", "stall").node).toBe("verify");
});
