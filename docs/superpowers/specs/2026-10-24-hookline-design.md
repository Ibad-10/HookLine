# Hookline: design

Night Shift hackathon (Mubit), London, 23 to 25 October 2026. Code freeze Sun 10:00.
Builders: Ibad and Claude. Background in `D:\Projects\scam-coach\HANDOVER.md`.

## 1. Intent

Hookline is a web app that helps anyone, of any age, get better at spotting scams.
It reads public scam news, turns it into short lessons and quizzes, lets people
practise in a voice call in the browser, and remembers what each person finds hard
so it can bring that back until they have it.

Why now: scams change every week and most advice is a static page. Hookline
refreshes itself from the news and adapts to each person.

The hackathon goal is to win Mubit's judging. Every LLM call goes through Mubit,
and the demo shows Mubit taking over work that frontier models did first.

## 2. Audience

Individuals of any age, on phone and desktop equally. Older users must be
comfortable: large text option, slow audio option, simple choices. Businesses are
not a target for version 1.

## 3. Goals

1. A new user can sign up, take a short starting quiz, and get a first lesson in
   under 3 minutes.
2. Lessons and quizzes come from scam reports published this week.
3. A voice practice call runs in the browser and ends safely if the user starts
   giving real sensitive data.
4. The app keeps a weak-spot profile per person and schedules repeats.
5. Mubit learns the recurring LLM jobs from frontier models and trained adapters
   take over, with the comparison shown on screen.

## 4. Non-goals (version 1)

- Business accounts, staff enrolment, admin dashboards.
- Reading anyone's email or messages.
- Real email or phone practice (Phase 2, section 10).

## 5. Anti-goals (fails even if it runs)

- Hookline stores any real card number, password, one-time code or bank detail.
- A practice session continues after the user starts giving real sensitive data.
- Generated content (lessons, quizzes, practice calls) uses a real company's
  name, logo or domain. The Scam news screen may report real cases as published,
  with a link to the source.
- A model grades its own output to produce the learning curve.
- Scraped page text can change the app's instructions.
- The app shames users (no public rankings, no "you failed" wording).

## 6. The parts

| Part | Job |
|---|---|
| **Learner** | Pulls public scam reports on a schedule. Writes a fixed-schema summary per scam (category, what it asks for, warning signs, source link). Page text never sits in an instruction position; output must fit the schema or is rejected. Stores summaries and links only. |
| **Teacher** | Writes a short lesson and a quiz from a summary, chosen for the user's weak spots. One fixed instruction, so it forms one Mubit task. |
| **Coach** | Runs the browser practice call. Scenario is a branching script with pre-generated ElevenLabs audio. Browser speech-to-text plus a fast matcher picks the branch. Only off-script replies go to the LLM through Mubit; a short delay there is acceptable. |
| **Gatekeeper** | Runs on every Coach turn, in the browser, before the text goes anywhere. Code rules first (card numbers with a Luhn check, codes, sort codes, account numbers, spoken digits, password phrases). Context rule: when the caller has just asked for a secret, any reply that is not a refusal or a question stops the call. LLM check last, and it only ever sees masked text. On a hit: stop the call, mask the text, log only "stopped at step N", show the debrief. |
| **Profile** | Per-user weak-spot record by scam category, updated from quiz answers and practice checkpoints. Picks the next lesson (about 1 weak : 2 known) and schedules repeats at about 2 days, 1 week, 3 weeks, then monthly. |

## 7. How Mubit is used

- All LLM calls use the Mubit gateway (`https://api.mubit.ai/openai/v1`,
  `/anthropic`, or compat routes), with provider keys in the Mubit console.
- Two recurring tasks with fixed system prompts: **Teacher** (summary + user
  context in the user message, lesson JSON out) and **Coach off-script turn**
  (scenario state + user reply in, next move JSON out).
- They start on frontier models. Mubit groups the calls into tasks, trains
  adapters once enough examples exist, and tests them against the frontier answers.
- Outcomes come from quiz answers (correct answer known in code) and practice
  checkpoints (detected in code). Never from a model grading itself.
- A "with vs without Mubit" dashboard (Ibad's request) runs the same inputs
  through three arms: a plain frontier model with no personalisation; a frontier
  model personalised the usual way, by putting the profile and past mistakes in a
  longer prompt; and the Mubit adapter. Measured: cost per lesson and per 1,000,
  latency p50/p95, prompt tokens per call, schema-valid rate, answer-key check
  pass rate, fictional-brand check pass rate, agreement with the frontier answer,
  and speed (time to first token, tokens per second, total time per lesson and per
  off-script call turn). Carbon is estimated, not measured: energy per call from
  token counts and model size using a published per-token figure, times a stated
  grid carbon intensity, shown as a range with the method on screen.
  Projected, and labelled as projected: monthly cost at 10k, 100k and 1M users,
  token growth in the stuffed-prompt arm as profiles grow, and whose servers the
  learner profile goes to.
- Open questions for Mubit (Ibad asks at the venue): can adapters be called from
  code this weekend? How long does one training run take? Does
  `x-middleware-record: off` keep a call out of training? Is Sapling on the gateway?
- Build order follows from the training limits: the Teacher prompt is frozen in
  the first hours and simulated users generate its traffic straight away, before
  most of the UI exists. Any later prompt change splits the task.
- If adapters can be called from code, the Mubit panel switches Teacher between
  frontier and adapter live. If not, it shows Mubit's own evaluation results and
  our frontier numbers, and says so on screen.

## 8. Measuring learning honestly

- About 200 simulated users, each with hidden weak spots set in code, answer
  quizzes and run scripted practice. The claim is only this: how many quizzes the
  profile needs to find each hidden weak spot, and whether the picker then targets
  it. No "scores go up" curve from simulated users, because their improvement
  would just be a rule we wrote.
- Simulated users answer from a pre-made lesson bank; a share of them make real
  Teacher calls through Mubit, which supplies the training examples.
- A held-out set of real scam examples from public reports is never used to pick
  lessons; its score is reported separately.

## 9. Screens

Home (today's 3-minute session, streak), Lesson, Quiz, Practice call, Debrief,
My progress (weak spots, why this lesson, upcoming repeats), Scam news, Settings
(text size, audio speed, language, delete my data). Mobile and desktop.

## 10. Phase 2: opt-in real-channel practice (not built by Claude)

Ibad wants opt-in practice by real email and phone later. Conditions: separate
opt-in per channel, changeable any time; ownership of the address and number
verified; every sending address and number published on the site; Gatekeeper
rules unchanged; delivered through a provider whose terms allow it, after a
legal check (UK GDPR, PECR). This phase is designed and built separately; the
Claude build does not include it.

## 11. Constraints

- Every LLM call through Mubit.
- Code written during the event, fresh (no reuse of Gatekeeper code).
- Keys in `.env` (Mubit, ElevenLabs, Anthropic, OpenAI, Groq); `.env.example` in repo.
- Commits as `Ibad-10`, no Claude trailer.

## 12. Decided by Ibad

Audience any age; phone and desktop; voice call is the star of the demo; goal is
Mubit judging; name Hookline; fresh code; ElevenLabs voice; start on frontier
models and let Mubit take over; Phase 2 real-channel listed.

## 13. Claude's calls (check these)

- Next.js + TypeScript, one app for UI and API routes.
- Data in SQLite for the weekend.
- Branch matching by embeddings or keyword rules before any LLM call.
- No accounts for the demo: guest start with a nickname, cookie session, no
  email verification.
- Speech-to-text sends audio to its provider (Chrome's sends it to Google). The
  privacy page says so, and every call starts by telling the user never to say
  real details. Hookline itself only stores masked text.
- Deploy to a public HTTPS URL so the call works on the presenter's phone
  (microphone needs HTTPS); presenter laptop on localhost is the fallback.

## 14. Look and feel (decided by Ibad, 24 Oct)

- A mix: a calm, trustworthy base (deep navy, large type, high contrast) for Home,
  the practice call and Settings, with playful touches in lessons (chunky buttons,
  a green or red feedback sheet, small celebrations).
- Animations: smooth transitions between questions, feedback sheet sliding up, a
  small celebration at the end of a lesson. All of it turns off when the device
  asks for reduced motion.
- Phone first: one-hand use, big tap targets, lessons designed for a phone screen
  and scaled up for desktop.
- Patterns (not visuals) come from Duolingo (lesson flow, feedback sheet, path) and
  Google's phishing quiz (answer buttons above a realistic message, "Show me" flags).
  The visual identity is Hookline's own.

## 15. Accounts, admin console and design language (decided by Ibad, 24 Oct)

This replaces "guest start with a nickname" in section 13 and the look in section 14.

- **Accounts:** Clerk. Sign in with an email code, Google, or email and password; Clerk remembers
  the device. Anyone can take the 5-question starting check without an account; at the end they are
  asked to sign up to save their progress, and the guest progress moves onto the new account.
  Lessons, calls, progress and settings need an account.
- **Admin console** at `/admin`, for addresses listed in `ADMIN_EMAILS`. Tabs: the Mubit comparison
  with its run button; learners in aggregate (sign-ups, sessions, weak-spot spread, no personal
  data); content (this week's briefs, a refresh-news button, recent lessons); adapters (a form to
  record the Mubit console's adapter results). `/mubit` stays public and read-only for judges.
- **Design language:** taken from `D:\Projects\design-notes\visuvate-DESIGN.md` (patterns only, our
  own content): light theme by default with a dark toggle; the landing hero and the practice call
  are always dark. Geist for UI and headings (tight tracking), Fraunces light italic for one word
  per heading, body at 18px. Electric blue `#0099ff` for primary actions, focus and glow; amber
  `#ffb840` is the red-flag highlighter. Pill buttons, a floating glass nav, hairline borders and a
  grey surface ladder instead of shadows, blue glow bars behind the dark hero, one motion curve
  `cubic-bezier(0.22, 0.61, 0.36, 1)`. Components from shadcn/ui; Aceternity-style effects only on
  the hero and call screen. Reduced-motion is honoured everywhere.

## 16. Phase 2 demo: one real call and one real email (decided by Ibad, 24 Oct)

Section 10 said the Claude build would not include real-channel practice. Ibad has asked for a
demo of it. Only this narrow version is built; the full Phase 2 (opt-in for anyone, ownership
checks for every number and address, a legal check) stays as section 10 describes.

- **Phone:** a Twilio trial account, which can only call numbers verified on that account (Ibad's
  own). A signed-in user who has opted in presses "Call me now"; Hookline dials only the number on
  file. The call opens with a one-line practice notice, then plays the existing scenario clips
  (`<Play>`), takes replies with `<Gather input="speech">`, and runs the existing engine and
  Gatekeeper on the server. The webhook checks `X-Twilio-Signature`. No new scam scripts.
- **Email:** sent with Resend's test sender, which only delivers to the account owner's address.
  It reuses an existing seed message with a made-up brand; its only link goes to a Hookline review
  page that records the outcome. No forms or input fields anywhere; a practice note in the footer.
- Ibad approves the first real call and the first real email before they are sent.
- **Update (24 Oct, Ibad):** each practice email is now written fresh by a Mailer task (through Mubit)
  from a random public scam brief, so no two are the same. It returns structured fields only; the app
  builds the HTML, adds the one review link, and refuses any draft that names a real brand or carries a
  web address, phone number or email address. The review page shows that email's own red flags.
  Phone numbers are confirmed by a texted 6-digit code before "Call me now" appears.
- **Update (24 Oct, Ibad): practice from history.** Practice emails and the new "Make me a new call"
  button both start from a public brief about one of the learner's three weakest scam types. A Caller
  task (through Mubit) writes only the names and lines of a call; the app fixes its steps, branches,
  what each step asks for, and the "is this real?" answer, then checks it like the hand-written calls
  (no real brands, no web addresses or phone numbers, no dead ends). Written calls are voiced on the
  fly in the same voice and run on the web only, never on the real phone line. Calls are suggested
  from weak spots on Home and after each call. Five hand-written calls now exist.
- **Update (24 Oct, Ibad): real calls from history.** "Call me now" now rings with a call written
  from the learner's weak spots (same fixed shape and checks as the web), falling back to the best
  recorded call. Each caller has a human ElevenLabs voice (male or female); Hookline's own notices
  use one narrator voice. At the "read me the code" step a real Twilio Verify code arrives by text
  to the learner's own confirmed number, so they practise refusing a genuine-looking code.
