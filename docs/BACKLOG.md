# Hookline backlog

Every feature idea lives here. Nothing is deleted; items move up a tier, never out.
Tiers are a proposal until Ibad approves the cut line.

- **H0 Must**: the demo slice. Nothing from H1 starts until every H0 row runs.
- **H1 Should**: makes it feel like a real product. Built after H0, before freeze.
- **H2 Nice**: only if H1 is done.
- **H3 Later**: after the weekend.
- **Phase 2**: opt-in real-channel practice. Designed and built separately, not by Claude.
- **Never**: principles, not backlog.

Status: ⬜ not started · 🔨 in progress · ✅ built

Code freeze: Sun 25 Oct 2026, 10:00 (clocks go back at 02:00 Sunday).

---

## H0 Must (demo slice)

| Status | Area | Item | Notes |
|---|---|---|---|
| ✅ | Start | Guest start with a nickname, no password | Cookie session. No email verification. |
| ✅ | Start | Starting quiz, 5 questions across scam types | Fills the first weak-spot profile. |
| 🔨 | Start | Three sign-up questions (age band, services used, language) | Cohort starting point; nothing else collected. |
| ✅ | Learner | Read this week's reports from 3 to 5 public sources | One ingest run plus a "refresh" button; schedule later. |
| ✅ | Learner | Fixed-schema scam brief per report | Category, technique, what it asks for, warning signs, safe action, source link, date. Page text never in an instruction position; off-schema output rejected. |
| ✅ | Teacher | Lesson (3 to 5 short cards) and quiz from a brief | One fixed system prompt: one Mubit task. Answer key fixed in the output, checked in code. |
| ✅ | Teacher | Fictional brands only in generated content | Code blocklist of real brand names plus a rewrite; fail closed. |
| ✅ | Quiz | Multiple choice | |
| ✅ | Quiz | Real or scam? | One message, two big buttons. |
| ✅ | Quiz | Tap the red flags | Fake text message or email mock; user taps suspicious parts (sender, link, urgency line). |
| ✅ | Quiz | Feedback sheet after every answer | Right/wrong, why, the trick's name (urgency, authority...), the safe action. Kind wording. |
| ✅ | Practice | Voice practice call in the browser | Branching pre-script, pre-generated ElevenLabs audio, speech-to-text, fast matcher picks the branch. |
| ✅ | Practice | Off-script replies through Mubit | Second fixed Mubit task. Short delay acceptable. |
| ✅ | Practice | Hang-up and "is this real?" always win | Hanging up or asking ends the call and counts as a pass. The app answers truthfully. |
| ✅ | Practice | Live captions and a big "End call" button | |
| ✅ | Practice | Checkpoints defined in code per scenario | "Gave a code", "agreed to move money", "shared card digits", "refused", "called back on official number". |
| ✅ | Practice | At least 2 scenarios | Bank "safe account" call; parcel delivery fee call. Fictional brands. |
| ✅ | Gatekeeper | Code rules on every user turn | Card numbers (Luhn), sort codes, account numbers, one-time codes, spoken digits, password phrases. |
| ✅ | Gatekeeper | Context rule | When the caller has just asked for a secret, any reply that is not a refusal or a question stops the call. |
| ✅ | Gatekeeper | Stop, mask, log only "stopped at step N" | Masking happens before any network call or log. |
| ✅ | Debrief | After every call | Timeline of the tricks used, where the user did well, the moment to hang up, what to do in real life. |
| ✅ | Profile | Weak-spot record by scam type and by trick | Updated from quiz answers and checkpoints only. |
| ✅ | Profile | Next-lesson picker, about 1 weak to 2 known | |
| ✅ | Profile | "Why this lesson" panel | Plain reason: "You missed the delivery-fee text on Tuesday." |
| 🔨 | Profile | Spaced repeats at about 2 days, 1 week, 3 weeks, then monthly | New example of the same trick each time, not the same question. Simulated clock for the demo. |
| ✅ | Screens | Home (today's 3-minute session), Lesson, Quiz, Call, Debrief, My progress, Settings | Phone and desktop. |
| ✅ | Access | Large text, slow audio, simple choices | Big tap targets, captions on by default. |
| ✅ | Mubit | Every LLM call through the Mubit gateway | Provider keys in the Mubit console. |
| ✅ | Mubit | Teacher prompt frozen early, traffic generated early | Training needs about 25 kept examples; 3 starts a day. |
| ✅ | Mubit | "With vs without Mubit" dashboard, three arms | (1) plain frontier LLM, no personalisation; (2) frontier LLM personalised the normal way, by stuffing the profile and past mistakes into a longer prompt; (3) Mubit adapter. Same inputs to all three. |
| ✅ | Mubit | Dashboard metrics, measured | Cost per lesson and per 1,000; latency p50/p95 (matters most for off-script call turns); prompt tokens per call; schema-valid output rate; answer-key check pass rate; fictional-brand check pass rate; agreement with the frontier answer. |
| ✅ | Mubit | Speed comparison, measured | Time to first token, tokens per second, total time per lesson and per off-script call turn, for all three arms. |
| ✅ | Mubit | Carbon comparison, estimated and labelled as such | Energy per call from token counts and model size, using a published per-token energy figure, times a stated grid carbon intensity. Method and assumptions shown on screen as a range, never as a measurement. |
| ✅ | Mubit | Dashboard metrics, projected and labelled as such | Monthly cost at 10k, 100k, 1M users; tokens growth as the profile grows in arm 2; whose servers the learner profile goes to (provider vs own model). |
| ✅ | Mubit | Live switch or honest fallback | Live switch if adapters are callable from code; Mubit's own eval results if not, said on screen. |
| ✅ | Measure | 200 simulated users with hidden weak spots | Chart: how many quizzes until the profile finds each hidden weak spot. |
| ✅ | Safety | "Practice" label on every practice screen | |
| ✅ | Safety | Scraped text is data, never instructions | |

## H1 Should

| Status | Area | Item | Notes |
|---|---|---|---|
| ✅ | Habit | Daily goal and streak, with a free streak freeze | Gentle: a missed day never shows as failure. |
| ⬜ | Habit | XP and levels ("Spotter", "Sharp", "Guardian") | |
| ⬜ | Habit | A badge for each trick learned | Prebunking idea: naming the trick is the lesson. |
| ✅ | Habit | Lesson path map | Units by scam type; locked/unlocked nodes; review nodes. |
| ⬜ | Habit | Mistakes review | Replays what you missed with fresh examples. |
| ⬜ | News | Scam news page | This week's briefs with source links; "new this week" tag. |
| ⬜ | Check | "Is this real?" checker | Paste a suspicious message; get the red flags and the safe action. Third Mubit task. Masks data first; never opens links. |
| ⬜ | Quiz | Inspect the link | Tap or long-press a link to reveal where it really goes. |
| ⬜ | Quiz | What would you do next? | Choose the safe action (call the number on your card, not the one in the message). |
| ⬜ | Quiz | Match the trick to the message | |
| ⬜ | Quiz | Confidence rating: "How sure are you?" | Shows over-confidence; feeds the profile. |
| ⬜ | Practice | Text-chat practice (fake SMS or chat thread) | Same branching engine as the call; fallback if voice fails. |
| ⬜ | Practice | 3 more call scenarios | Tax refund, tech support, "Hi Mum" new number, investment. |
| ⬜ | Practice | Hint button during the call | "What should I ask?" |
| ⬜ | Practice | Difficulty levels | Easy (obvious caller) to realistic. Capped at realistic. |
| ✅ | Learning loop | Off-script replies suggested as new script branches | Shows the system getting better from use. |
| ⬜ | Measure | Held-out set of real scam examples | Never used to pick lessons; score reported separately. |
| ⬜ | Mubit | Learner extraction as its own Mubit task | |
| ⬜ | Help | "I think I've been scammed" page | UK steps: call your bank on the number on your card, 159, report fraud, forward scam texts to 7726. |
| ⬜ | Help | Family safe word card | Agree a word with family to beat voice-clone calls. |
| ⬜ | Access | Read-aloud lessons | Same voice, adjustable speed. |
| ⬜ | Access | High contrast and reduced motion | |
| ⬜ | Privacy | Delete my data, one button | |
| ⬜ | Privacy | Plain privacy page | What is stored, what speech-to-text sees, what Mubit sees. |
| ⬜ | Safety | Distress words end the call kindly | "I'm scared", "is this real" and similar: end, reassure, show help links. |

## H2 Nice

| Status | Area | Item | Notes |
|---|---|---|---|
| ⬜ | Language | More languages (for example Urdu, Polish, Punjabi, Spanish) | Translation as a Mubit task; audio per language multiplies cost. |
| ⬜ | Family | Family circle | Share progress privately with a relative who helps you. Encouragement only, no ranking. |
| ⬜ | Habit | Reminders by web push | |
| ⬜ | Practice | In-app fake inbox | Several emails, find the scams. Stays inside the app. |
| ⬜ | Practice | Voicemail exercise | Listen to a message, choose what to do. |
| ⬜ | Practice | "Think like a scammer" mode | You pick the tricks; the app names each one (Bad News style prebunking). |
| ⬜ | Practice | Voice-clone awareness | Which of two stock voices is synthetic. Never clones a real person. |
| ⬜ | Practice | Replay a call to try another branch | |
| ⬜ | Content | Scenario graph view and editor | See and edit the branching script. |
| ⬜ | Content | Review queue for generated lessons | Approve before publish. |
| ⬜ | Habit | Share card ("I spotted 10 scams this week") | No personal data on it. |
| ⬜ | Access | Dyslexia-friendly font option, dark mode | |
| ⬜ | Habit | Completion certificates | |
| ⬜ | Measure | Calibration chart per user | Confidence vs accuracy over time. |

## H3 Later (after the weekend)

- Employer and bank dashboards, aggregate only, never used for discipline.
- Bank and charity white-label (for example for an older-people's charity).
- Group mode for care homes and community centres (a helper runs a session on one screen).
- Schools mode, after a separate safety review for children.
- Browser extension that runs the "Is this real?" check on the page you are on.
- Forward-a-message bot on a chat app, user-initiated only.
- A phone number people can call to practise (inbound only, user starts the call).
- Native apps; more regions (US, India) with local help steps.
- Accounts with email sign-in, SSO for organisations.
- Experiments (A/B) on lesson formats against the held-out score.

## Phase 2: opt-in real-channel practice (not built by Claude)

Ibad's requirement. For users who opt in, practice also arrives by real email and phone.
Separate opt-in per channel, changeable any time; ownership of each address and number
verified; every sending address and number published on the site; Gatekeeper rules
unchanged; delivered through a provider whose terms allow it, after a legal check
(UK GDPR, PECR). Designed and built separately.

## Never

Store a real card number, password, one-time code or bank detail · continue a practice
after real sensitive data starts · use a real company's name, logo or domain in
generated content · let a model grade its own output · let scraped text change
instructions · shame users or rank them publicly · show a "scam-proof" badge
(knowledge and confidence do not equal resistance) · clone a real person's voice ·
contact anyone who has not opted in.

## Later: live ElevenLabs agent on real phone calls
- Built and tested: agent "Hookline practice caller" (`ELEVENLABS_AGENT_ID`), brain at `/api/agent/llm`
  (Gatekeeper and safety exits first, then Claude via Mubit), hand-over via ElevenLabs register-call.
- Off (`PHONE_AGENT=off`): on Twilio's shared trial number the media stream never opened (conversation
  stuck at "initiated"). Needs Hookline's own Twilio number: upgrade Twilio, buy a US voice number, set
  `TWILIO_FROM_NUMBER`, set `PHONE_AGENT=on`, test one call and read Twilio Monitor, Logs, Errors.
- Same agent could also run the web practice call in the browser (no Twilio needed).
- **Update (25 Oct):** real calls now go through ElevenLabs' outbound-call API from the Twilio number
  imported in the ElevenLabs workspace ("Donna (Twilio)", owned by Ibad's friend Sahid, who agreed),
  using the Hookline agent (`ELEVENLABS_PHONE_NUMBER_ID`). Falls back to our Twilio loop if it fails.
  Agent voice: eleven_v3_conversational with expressive mode; 1.5 s "Mm, right." filler if the brain is slow.
