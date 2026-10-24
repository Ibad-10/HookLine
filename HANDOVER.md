# Hookline: start here

Night Shift hackathon (Mubit). Code freeze Sun 25 Oct 2026, 10:00 (clocks go back at 02:00 Sunday).

- Live: https://hookline-one-iota.vercel.app (Vercel project `hookline`, auto-deploys from `main`)
- Repo: https://github.com/Ibad-10/HookLine
- Design canvas (Claude Design, private): https://claude.ai/artifact/2VpefR8E7SFtukLdKztg2A
- Design doc: `docs/superpowers/specs/2026-10-24-hookline-design.md` (sections 14 and 15 are the latest decisions)
- Backlog: `docs/BACKLOG.md` · research: `docs/research/`

## What is built (24 Oct, evening)

- Lessons from this week's public scam reports (Learner -> Teacher via Mubit, Claude Haiku), three
  question types, grading in code, spaced repeats, weak-spot profile, "why this lesson".
- Practice calls: two scenarios, ElevenLabs voice clips, microphone first (Scribe), typing fallback,
  Gatekeeper stops on cards, codes and bank details, debrief.
- Accounts: Clerk (Google, email + password). Guests can take the starting check, then sign up and keep it.
  Learner rows link to Clerk users via `learners.clerk_user_id`.
- Admin console `/admin` for `ADMIN_EMAILS` (ibadullahzuberi@gmail.com): Mubit comparison with charts/table,
  learners, content with Refresh news, adapter form. Public read-only `/mubit`.
- Design from the canvas (Visuvate-based): scrolling landing, auth pages, Home with animated streak and week
  row, incoming-call card, rope path with raised stops, lesson feedback, light/dark, phone and laptop.
- Data: Turso (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`); all keys in `.env` and Vercel, never in git.
- 84 unit tests (`npm test`).

## Open items

1. Signed-in screens not yet checked on a real phone and laptop (Home, lesson, call, /admin): Ibad to send screenshots.
2. Voice call never tried with a real microphone; the first clip now starts inside the tap for iPhone.
3. Mubit adapters: tasks were "Reviewing examples, 0 of 25 kept". Check the console. If still stuck, run
   ingest for more real reports and send varied Teacher calls; never change `TEACHER_SYSTEM`.
4. Small-model column fails: Mubit's shared Groq credit runs out. Add our own Groq key in the Mubit console.
5. Phase 2 (real phone and email practice) is not built; see design doc section 10.

## How to work with Ibad

- Often on a remote session: ask with AskUserQuestion, put text to read in the option preview.
- Terse chat; docs in plain English. Never cut scope without asking.
- Commits as `Ibad-10`, never a Claude co-author line. Never paste keys in chat; they live in `.env`.
- Rotate the Mubit key (printed once in a log) and the old Groq key after the event.
