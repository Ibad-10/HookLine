// Which learner record belongs to this visitor. A signed-in Clerk user owns one learner;
// a guest has a cookie. Signing up claims the guest's progress, once.
import { randomUUID } from "node:crypto";
import { db, migrate } from "./db";

export async function resolveLearner(
  clerkUserId: string | null,
  guestId: string | null,
  name: string | (() => Promise<string>),
): Promise<string | null> {
  await migrate();
  if (!clerkUserId) return guestId;
  const own = await db().execute({ sql: "SELECT id FROM learners WHERE clerk_user_id = ?", args: [clerkUserId] });
  if (own.rows[0]) return String(own.rows[0].id);
  if (guestId) {
    const claimed = await db().execute({
      sql: "UPDATE learners SET clerk_user_id = ? WHERE id = ? AND clerk_user_id IS NULL",
      args: [clerkUserId, guestId],
    });
    if (claimed.rowsAffected === 1) return guestId;
  }
  const id = randomUUID();
  await db().execute({
    sql: "INSERT INTO learners (id, nickname, age_band, services, lang, created_at, clerk_user_id) VALUES (?, ?, 'skip', '[]', 'en', ?, ?)",
    args: [id, (typeof name === "string" ? name : await name()).slice(0, 40) || "Friend", Date.now(), clerkUserId],
  });
  return id;
}
