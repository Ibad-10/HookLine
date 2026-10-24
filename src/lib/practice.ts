// Shared helpers for real-channel practice (design doc section 16).
import { randomUUID } from "node:crypto";
import { defaultPrefs, type Stored } from "./contact";
import { db, migrate } from "./db";

export const PUBLIC_URL = () => process.env.PUBLIC_URL || "https://hookline-one-iota.vercel.app";

export async function contactPrefs(learnerId: string): Promise<Stored> {
  await migrate();
  const r = await db().execute({ sql: "SELECT contact_prefs FROM learners WHERE id = ?", args: [learnerId] });
  const v = r.rows[0]?.contact_prefs;
  return v ? { ...defaultPrefs(), ...JSON.parse(String(v)) } : defaultPrefs();
}

// One real call or email per channel every 5 minutes per learner.
export const GAP_MS = 5 * 60_000;

export async function recentlySent(learnerId: string, channel: string, now = Date.now()): Promise<boolean> {
  const r = await db().execute({
    sql: "SELECT 1 FROM practice_sends WHERE learner_id = ? AND channel = ? AND sent_at > ? LIMIT 1",
    args: [learnerId, channel, now - GAP_MS],
  });
  return Boolean(r.rows[0]);
}

export async function recordSend(learnerId: string, channel: string, scenario: string): Promise<string> {
  const id = randomUUID();
  await db().execute({
    sql: "INSERT INTO practice_sends (id, learner_id, channel, scenario, sent_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, learnerId, channel, scenario, Date.now()],
  });
  return id;
}
