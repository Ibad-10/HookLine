// The learner's weakest scam types and tricks, and a public brief to build practice from.
import seedBriefs from "../data/seed-briefs.json";
import { db, migrate } from "./db";
import { type Skill, weakness } from "./profile";
import type { Brief } from "./schemas";
import { CATEGORIES, TECHNIQUES } from "./taxonomy";

// Unseen skills count as half-known, like the call suggestions.
const rank = (skills: Skill[], keys: readonly string[]) => {
  const by = new Map(skills.map((s) => [s.key, weakness(s)]));
  return [...keys].sort((a, b) => (by.get(b) ?? 0.5) - (by.get(a) ?? 0.5));
};
export const weakestCategories = (skills: Skill[]) => rank(skills, CATEGORIES);
export const weakestTricks = (skills: Skill[]) => rank(skills, TECHNIQUES);

// A recent brief for one of the learner's three weakest scam types, picked at random among them
// so practice varies; any brief if none match.
export async function briefForWeakSpot(skills: Skill[]): Promise<Brief> {
  await migrate();
  const top = weakestCategories(skills).slice(0, 3);
  const row = (await db().execute({ sql: `SELECT brief_json FROM briefs WHERE category IN (?, ?, ?) ORDER BY RANDOM() LIMIT 1`, args: top })).rows[0]
    ?? (await db().execute("SELECT brief_json FROM briefs ORDER BY RANDOM() LIMIT 1")).rows[0];
  if (row) return JSON.parse(String(row.brief_json)) as Brief;
  const seeds = Object.values(seedBriefs) as Brief[];
  return seeds.find((b) => top.includes(b.category)) ?? seeds[Math.floor(Math.random() * seeds.length)];
}
