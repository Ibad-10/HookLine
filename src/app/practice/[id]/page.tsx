// Where the practice email's link lands: records the click and explains the tricks.
// No forms or inputs here, ever.
import Link from "next/link";
import { db, migrate } from "@/lib/db";
import { saveOutcome } from "@/lib/profile";

export default async function Caught({ params }: PageProps<"/practice/[id]">) {
  const { id } = await params;
  await migrate();
  const row = (await db().execute({ sql: "SELECT learner_id, opened_at FROM practice_sends WHERE id = ?", args: [id] })).rows[0];
  if (row && !row.opened_at) {
    await db().execute({ sql: "UPDATE practice_sends SET opened_at = ?, outcome = 'clicked' WHERE id = ?", args: [Date.now(), id] });
    await saveOutcome(String(row.learner_id), ["delivery_fee", "urgency", "payment_method"], false, "email");
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <p className="w-fit rounded-full bg-mark px-3 py-1 text-sm font-semibold text-black">Hookline practice</p>
      <h1 className="mt-5 text-[2.6rem] font-medium leading-none tracking-[-0.045em]">
        That was a <span className="font-serif font-light italic">practice</span> scam
      </h1>
      <p className="mt-4 text-lg text-ink-soft">
        No harm done: nothing was paid and nothing was shared. Here’s what should have made you pause.
      </p>
      <ul className="mt-6 space-y-3 text-lg">
        <li className="rounded-2xl bg-card p-4 ring-1 ring-line"><span className="mark font-semibold">Pay within 30 minutes</span>: rushing you so you don’t check.</li>
        <li className="rounded-2xl bg-card p-4 ring-1 ring-line"><span className="mark font-semibold">A small fee</span>: small amounts feel safe; the real aim is your card details.</li>
        <li className="rounded-2xl bg-card p-4 ring-1 ring-line"><span className="mark font-semibold">A button to pay</span>: check deliveries in the courier’s own app or website instead.</li>
      </ul>
      <Link href="/home" className="btn-chunky btn-grad lift mt-8 grid place-items-center text-lg">Back to Hookline</Link>
    </main>
  );
}
