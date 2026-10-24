import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function db(): Client {
  client ??= createClient({
    url: process.env.DATABASE_URL ?? "file:hookline.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  return client;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, nickname TEXT, age_band TEXT, services TEXT, lang TEXT, large_text INT DEFAULT 0, slow_audio INT DEFAULT 0, created_at INT)`,
  `CREATE TABLE IF NOT EXISTS briefs (id TEXT PRIMARY KEY, source_url TEXT UNIQUE, source_name TEXT, published_at INT, category TEXT, technique TEXT, brief_json TEXT, created_at INT)`,
  `CREATE TABLE IF NOT EXISTS lessons (id TEXT PRIMARY KEY, brief_id TEXT, learner_id TEXT, lesson_json TEXT, arm TEXT, created_at INT)`,
  `CREATE TABLE IF NOT EXISTS skills (learner_id TEXT, key TEXT, correct INT, seen INT, box INT, due_at INT, PRIMARY KEY (learner_id, key))`,
  `CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, learner_id TEXT, kind TEXT, key TEXT, ok INT, detail TEXT, at INT)`,
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`,
  `CREATE TABLE IF NOT EXISTS phone_codes (learner_id TEXT PRIMARY KEY, number TEXT, hash TEXT, expires_at INT, tries INT)`,
  `CREATE TABLE IF NOT EXISTS practice_sends (id TEXT PRIMARY KEY, learner_id TEXT, channel TEXT, scenario TEXT, sent_at INT, opened_at INT, outcome TEXT)`,
  `CREATE TABLE IF NOT EXISTS calls (id INTEGER PRIMARY KEY, task TEXT, arm TEXT, model TEXT, request_id TEXT, in_tok INT, out_tok INT, ms INT, ttft_ms INT, ok INT, checks TEXT, at INT)`,
];

let migrated: Promise<void> | null = null;

export function migrate(): Promise<void> {
  migrated ??= db()
    .batch(SCHEMA, "write")
    // Added after launch: link a learner to a Clerk account. Fails harmlessly if it already exists.
    .then(() => db().execute("ALTER TABLE learners ADD COLUMN clerk_user_id TEXT").catch(() => undefined))
    .then(() => db().execute("CREATE UNIQUE INDEX IF NOT EXISTS learners_clerk ON learners (clerk_user_id)"))
    .then(() => db().execute("ALTER TABLE learners ADD COLUMN contact_prefs TEXT").catch(() => undefined))
    .then(() => undefined);
  return migrated;
}
