// Per-learner reminder and contact choices. Opt-ins are separate per channel and record
// when they were given; turning one off forgets the number. (Phase 2 sends nothing yet.)
import { z } from "zod";

export const ContactPrefs = z.object({
  reminders: z.boolean(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  phone: z.object({ on: z.boolean(), number: z.string().max(20) }).refine(
    (p) => !p.on || /^\+?[0-9 ()-]{7,20}$/.test(p.number),
    "Enter a phone number with its country code, like +44 7700 900123.",
  ),
  email: z.object({ on: z.boolean() }),
});
export type ContactInput = z.infer<typeof ContactPrefs>;
export type Stored = {
  reminders: boolean;
  reminderTime: string;
  phone: { on: boolean; number: string; at: number | null; verified?: boolean };
  email: { on: boolean; at: number | null };
};

export const defaultPrefs = (): Stored => ({
  reminders: false, reminderTime: "18:00", phone: { on: false, number: "", at: null }, email: { on: false, at: null },
});

// A number stays verified only while it is unchanged; any new number needs a fresh code.
function phoneOn(old: Stored, number: string, now: number): Stored["phone"] {
  return { on: true, number, at: old.phone.on ? old.phone.at : now, verified: Boolean(old.phone.verified) && old.phone.number === number };
}

export function applyPrefs(old: Stored, input: ContactInput, now: number): Stored {
  return {
    reminders: input.reminders,
    reminderTime: input.reminderTime,
    phone: input.phone.on ? phoneOn(old, input.phone.number.replace(/[^\d+]/g, ""), now) : { on: false, number: "", at: null, verified: false },
    email: input.email.on ? { on: true, at: old.email.on ? old.email.at : now } : { on: false, at: null },
  };
}
