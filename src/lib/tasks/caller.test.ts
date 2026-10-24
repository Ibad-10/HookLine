import { beforeAll, expect, test } from "vitest";
import seedBriefs from "../../data/seed-briefs.json";
import { getScenario } from "../call/getScenario";
import { startCall, step } from "../call/engine";
import { migrate } from "../db";
import type { Complete } from "../llm";
import { writeCall } from "./caller";

beforeAll(() => migrate());
const fake = (o: unknown): Complete => async () => ({ requestId: null,
  stream: (async function* () { yield { choices: [{ delta: { content: JSON.stringify(o) } }] }; })() });
const brief = Object.values(seedBriefs)[0] as never;
const good = {
  title: "Your energy supplier offers a refund", caller: "Priya, Brightwell Energy", brand: "Brightwell Energy", verify_asks: "card",
  lines: { open: "Hi, it's Priya from Brightwell Energy. You're owed a refund of eighty pounds. Shall I process it?",
    identity: "I understand. I have your account in front of me. Shall I process the refund?",
    verify: "To send it, I need the long number on your card.", pressure: "The refund closes today.",
    safe_account: "First there's a small release fee of ten pounds.", secrecy: "Keep this between us and pay now.",
    end_safe: "Fine, bye.", end_scammed: "Thanks, all done." },
};

test("a written call is stored, loads back and runs through the same Gatekeeper", async () => {
  const sc = await writeCall(brief, ["urgency"], "learner-x", fake(good));
  expect(sc?.id).toMatch(/^gen-/);
  const back = await getScenario(sc!.id);
  expect(back?.nodes.verify.ask).toBe("card");
  const s = { ...startCall(back!), node: "verify" };
  expect(step(s, back!, "it's four five three nine one two three four", "voice").state.outcome).toBe("stopped");
});

test("a call naming a real company or giving a phone number is refused", async () => {
  expect(await writeCall(brief, [], "l", fake({ ...good, brand: "British Gas", caller: "Priya, HSBC" }))).toBeNull();
  expect(await writeCall(brief, [], "l", fake({ ...good, lines: { ...good.lines, open: "Call us on 0800 123 4567." } }))).toBeNull();
});
