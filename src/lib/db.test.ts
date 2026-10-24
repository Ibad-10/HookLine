import { expect, test } from "vitest";
import { db, migrate } from "./db";

test("migrate creates tables and is idempotent", async () => {
  await migrate();
  await migrate();
  await db().execute({
    sql: "INSERT INTO learners (id, nickname, created_at) VALUES (?, ?, ?)",
    args: ["l1", "Sam", 1],
  });
  const r = await db().execute("SELECT nickname FROM learners WHERE id = 'l1'");
  expect(r.rows[0].nickname).toBe("Sam");
});
