# Hookline: start here

Night Shift hackathon (Mubit). Code freeze Sun 25 Oct 2026, 10:00 (clocks go back at 02:00 Sunday).

- Live: https://hookline-one-iota.vercel.app (Vercel project `hookline`, auto-deploys from `main`)
- Repo: https://github.com/Ibad-10/HookLine
- Design: `docs/superpowers/specs/2026-10-24-hookline-design.md`
- What is built and what is left: `docs/BACKLOG.md` (✅ built, 🔨 partly, ⬜ not started)
- Build plan and its ledger: `docs/superpowers/plans/2026-10-24-hookline-h0.md`, `.superpowers/sdd/` (local only)
- Research: `docs/research/`

## State (24 Oct, morning)

- All H0 rows built except the simulated clock for spaced repeats and using the sign-up answers as starting
  weights (`priorsFor` exists, not wired). 73 unit tests pass (`npm test`).
- UI pass done: motion animations, sounds (Web Audio, mute in Settings), Buoy guide, streak flame,
  lesson path, shadcn switches and tabs.
- Frontier model is `claude-haiku-4-5` through Mubit's Anthropic route; small stand-in is
  `openai/gpt-oss-20b` through Mubit's Groq route.
- Database: Turso (`DATABASE_URL`, `DATABASE_AUTH_TOKEN` in `.env` and in Vercel).

## Open items

- The small-model column on `/mubit` fails because Mubit's shared Groq starter credit hits its daily
  token limit. Fix: add our own Groq key in the Mubit console (Provider keys), then press "Run the
  comparison again" on `/mubit`.
- Mubit adapters: tasks were "Reviewing examples" with 0 of 25 kept. Check the console; copy the
  adapter results into `src/data/adapter-console.json` by hand (there is no API).
- Voice hold-to-talk (ElevenLabs Scribe) has not been tried with a real microphone yet.
- Final whole-branch code review (superpowers executing-plans) still to run.

## How to work with Ibad

- Often on a remote session: ask with AskUserQuestion, put text to read in the option preview.
- Terse chat; docs in plain English. Never cut scope without asking.
- Commits as `Ibad-10`, never a Claude co-author line. Never paste keys in chat; they live in `.env`.
- Rotate the Groq key that appeared in an old chat, and the Mubit key that was printed once in this one.
