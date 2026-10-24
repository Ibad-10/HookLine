// Runs in the browser on every user turn, before the text goes anywhere.
export type Ask = "card" | "code" | "bank" | "password" | "money" | null;

const WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4",
  five: "5", six: "6", seven: "7", eight: "8", nine: "9",
};

export function normalizeSpoken(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine)\b/g, (w) => WORDS[w]);
  // join digit groups split by spaces, dashes or dots: "4 8 2-9" -> "4829"
  return words.replace(/(\d)[\s.-]+(?=\d)/g, "$1");
}

export function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

const SECRET_WORD = /\b(password|passcode|pin|memorable word|secret word)\b\s*(?:is|was|:)?\s*/i;
// Bare assent or stalling ("ok", "hold on") is not handing over the secret.
const ASSENT = /^\s*((yes|yeah|ok|okay|sure|right|alright|fine|go on|hold on|wait|one (sec|second|moment)|a moment|um+|hmm+|er+)[\s.,!]*)+$/i;
const SAFE_REPLY =
  /\b(no|nope|won't|will not|not giving|call (you|my bank|them) back|hang up|who|why|what|which|is this real|scam)\b|\?/i;

export function gate(text: string, ask: Ask): { stop: boolean; kinds: string[]; masked: string } {
  const norm = normalizeSpoken(text);
  const kinds = new Set<string>();
  const runs = norm.match(/\d+/g) ?? [];

  if (runs.some((r) => r.length >= 13 && r.length <= 19 && luhn(r))) kinds.add("card");
  if (/sort ?code/.test(norm) && runs.some((r) => r.length === 6)) kinds.add("bank");
  if (/\b\d{2}-\d{2}-\d{2}\b/.test(text)) kinds.add("bank");
  if (/account/.test(norm) && runs.some((r) => r.length >= 7 && r.length <= 10)) kinds.add("bank");
  if (/\b(code|pin|otp|passcode|verification)\b/.test(norm) && runs.some((r) => r.length >= 4 && r.length <= 8))
    kinds.add("code");
  if (!kinds.size && runs.some((r) => r.length >= 6 && r.length <= 8)) kinds.add("code");
  if (SECRET_WORD.test(norm)) kinds.add("password");

  const context = ask !== null && ask !== "money" && !SAFE_REPLY.test(text) && !ASSENT.test(text);
  if (context) kinds.add(`answered_${ask}`);

  const masked = norm
    .replace(/\d{4,}/g, "•••")
    .replace(new RegExp(SECRET_WORD.source + "(\\S+(\\s+\\S+)?)", "i"), (m, _w, secret) => m.replace(secret, "•••"));

  return { stop: kinds.size > 0, kinds: [...kinds], masked: context ? "•••" : masked };
}
