// Spending and nuisance limits for paid or outward-facing actions (voices, phone calls).
import { db, migrate } from "./db";

// True if "who" may do "kind" now (fewer than max in the last windowMs); records the use if so.
export async function allow(kind: string, who: string, max: number, windowMs: number): Promise<boolean> {
  await migrate();
  const since = Date.now() - windowMs;
  const n = Number((await db().execute({ sql: "SELECT count(*) n FROM usage_log WHERE kind = ? AND who = ? AND at > ?", args: [kind, who, since] })).rows[0].n);
  if (n >= max) return false;
  await db().execute({ sql: "INSERT INTO usage_log (kind, who, at) VALUES (?, ?, ?)", args: [kind, who, Date.now()] });
  return true;
}
