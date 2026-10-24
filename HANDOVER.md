# Hookline: start here

New Claude Code session, 24 Oct 2026. Night Shift hackathon (Mubit), code freeze Sun 25 Oct 10:00.

Read in this order:
1. `docs/superpowers/specs/2026-10-24-hookline-design.md`: the design (draft).
2. `D:\Projects\scam-coach\HANDOVER.md`: background, Mubit facts from the live
   docs, the 12 weak spots and fixes, the feature tiers, the demo idea.

## Where things stand

- Brainstorming (superpowers:brainstorming) is mid-way. The design is written but
  **not yet approved by Ibad**, and the builder check (fresh subagent with the
  skill's `builder-check-prompt.md`) has not run.
- Next steps, in order: run the builder check, bring Ibad the questions only he
  can answer, update the design, get approval, then superpowers:writing-plans,
  then build test-first.
- `.env.example` is in place. Ibad will add keys (Mubit, ElevenLabs; provider
  keys for Anthropic, OpenAI and Groq go in the Mubit console).
- No product code yet. Fresh code only (no reuse of Gatekeeper code).

## Ibad's answers so far

- Audience: individuals of any age. Businesses later.
- Devices: phone and desktop equally.
- Voice practice call must be in the demo (ElevenLabs). Calls use a branching
  pre-script with pre-generated audio; the LLM is used only for off-script replies.
- Goal this weekend: win Mubit judging.
- Teacher and Coach start on normal frontier LLMs through Mubit; Mubit learns and
  its adapters take over.
- Stack: left to Claude (design says Next.js + TypeScript, SQLite).
- Name: Hookline.
- Wants opt-in real email and phone practice later. The design lists it as Phase 2,
  built or sourced separately through a provider; Claude does not design or build it.

## How to work with Ibad

- He is often on a remote session and can't read long chat. Ask with
  AskUserQuestion (multiple choice), putting any text he must read in the option
  preview box. He can answer longer questions by voice note.
- Terse chat (caveman); docs in plain English.
- Grill ideas hard; research-backed (Scopus via Chrome when he is signed in).
- Never cut scope without asking. Commits as `Ibad-10`, no Claude trailer.
- Rotate the Groq key that appeared in plain text in chat `6cbc38dd`.
