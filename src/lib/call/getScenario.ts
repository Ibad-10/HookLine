// Server only: hand-written calls first, then calls written for one learner (in the database).
import { db, migrate } from "../db";
import { SCENARIOS } from "./scenarios";
import type { Scenario } from "./types";

export async function getScenario(id: string): Promise<Scenario | null> {
  if (SCENARIOS[id]) return SCENARIOS[id];
  if (!id.startsWith("gen-")) return null;
  await migrate();
  const row = (await db().execute({ sql: "SELECT scenario_json FROM gen_scenarios WHERE id = ?", args: [id] })).rows[0];
  return row ? (JSON.parse(String(row.scenario_json)) as Scenario) : null;
}
