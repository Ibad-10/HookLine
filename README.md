# HookLine

HookLine helps people of any age get better at spotting scams. It reads this week's
public scam reports, turns them into three-minute lessons and quizzes, and lets you
practise on a voice call in the browser that you're allowed to hang up on. It keeps a
weak-spot profile for each person and brings back the scams they find hard.

Built at the Night Shift hackathon (Mubit), London, October 2026.

## What's in it

- **Learner** reads public scam feeds (Which?, Get Safe Online, FBI IC3, FTC) and writes a
  short, fixed-format brief for each report. Page text is treated as data, never as instructions.
- **Teacher** writes a lesson and quiz from a brief, aimed at the learner's weak spots.
  Lessons use made-up company names only, and a check rejects any real brand.
- **Practice call**: a branching script with ElevenLabs voice. You can talk or type.
  Hanging up, asking questions or asking "is this real?" always counts as a pass.
- **Gatekeeper** checks every reply in the browser, before anything leaves the device. If
  you start giving a card number, code, bank details or a password, it stops the call and
  keeps nothing.
- **Profile**: tracks which scam types and tricks you find hard, and brings them back after
  about 2 days, 1 week, 3 weeks, then monthly.
- **With vs without Mubit** (`/mubit`): the same inputs run three ways (big model, big model
  with the profile pasted in, and a small model of adapter size). It compares cost, speed,
  output checks and estimated carbon, all measured from real calls.

Every LLM call goes through the [Mubit](https://mubit.ai) gateway, which groups recurring
calls into tasks and trains small adapter models on them. Answers are graded in code against
the answer key. A model never grades its own output.

## Run it

```bash
npm install
cp .env.example .env        # add your Mubit and ElevenLabs keys
npm run dev                 # http://localhost:3000
npm test                    # unit tests, no keys needed
```

Optional scripts (they need the keys in `.env`):

```bash
npx tsx --env-file=.env scripts/ingest.mts          # read this week's scam reports
npx tsx --env-file=.env scripts/simulate.mts        # simulated learners for the dashboard
npx tsx --env-file=.env scripts/gen-audio.mts       # caller audio clips
```

Design, research and the build plan are in `docs/`.
