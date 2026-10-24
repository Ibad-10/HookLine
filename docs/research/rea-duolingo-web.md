# Duolingo web: UI pattern study for Hookline

Study date: 2026-10-24. Method: REA `capture_browser_scenario` in launch mode (headless Chrome 155, temp profile, guest path only, cookies rejected, no account, no personal data). Desktop 1280x800 and phone 390x844 @2x. Screenshots live outside the repo (session scratchpad `rea/duolingo/`).

Labels: **[O]** observed in a capture, **[I]** inferred, **[U]** unknown. Evidence IDs are shortened to their first 12 hex characters.

Runs: landing ev_1e61be1ca0e1; course picker ev_543c988d545c; onboarding ev_415fc0b299c6, ev_5de399389eb2, ev_a226129eb476, ev_1d763934aa4d; lesson ev_5b784d5ee9fd; wrong answer ev_62596b370260; right answer + skip ev_d40d8f2513bf; phone ev_eb4db18fda25; exercise walk ev_c842eb6df919, ev_3761382fe1ab.

---

## 1. Screen-by-screen

### Landing [O] (ev_1e61be1ca0e1)
Illustration left; headline plus a solid primary button ("Get started", to `/register`) and an outlined secondary button on the right. The cookie banner is an `alertdialog` with equal-weight Reject and Accept.

### Course picker [O] (ev_543c988d545c)
A 4-column grid of large card `<button>`s (icon, name, learner count). One tap goes to `/welcome`; no sign-up.

### Onboarding ("funboarding") [O]
URL `/welcome?welcomeStep=…`. Every screen shares one template:
- **Top bar**: back arrow plus a thick (16px) rounded `progressbar` that fills a bit each step.
- **Guide character + speech bubble**: the question types out letter by letter; options appear only after it finishes (about 3–4 s).
- **Options**: `radiogroup` of `radio` cards, roving tabindex. A pick turns the card light blue and the bubble instantly swaps to a short reaction to that choice (for the daily goal it estimates words learned in week one).
- **Footer**: sticky bar, one Continue button, **disabled (grey) until a choice is made** and briefly disabled again after each click.

Steps observed, in order (ev_a226129eb476, ev_1d763934aa4d, ev_5b784d5ee9fd):
1. Character says hi (text only).
2. "Let's get this party started" (text only).
3. How did you hear about us: 9 icon cards in 2 columns.
4. Why are you learning: 7 options.
5. How much do you already know: 5 levels, from new to advanced.
6. "Here's what you can achieve": 3 benefit rows, info only.
7. Daily goal: 4 rows (5/10/15/20 min) with a label on the right (Casual…Intense).
8. Choose path: "Start from scratch" or "Find my level".
9. Two motivation screens: it can be hard to stay motivated, so this is built like a game.
10. → `/lesson`.

About 11 screens from landing to the first exercise, roughly 60–70 s. **Sign-up is deferred completely**: no account, email or name field before the lesson. When the sign-up prompt appears later is [U].

### Lesson screen anatomy [O] (ev_5b784d5ee9fd, ev_d40d8f2513bf)
- **Header row**: a close X on the left, then a wide progress bar, then a heart icon and count ("5") on the right. The progress bar moves forward after every answered item, wrong or skipped included.
- **Prompt area**: an optional small coloured tag above the question ("New word"), then a large bold `h1` instruction.
- **Answer area**: depends on the exercise type (see section 2).
- **Footer**: a full-width band with a top divider. Skip (outlined) sits on the left and Check on the right. Check is **grey and disabled until something is selected, then turns solid green**. On phone the Skip button was **not present**, and Check spans the full width (about 358 CSS px wide, about 46 px tall) (ev_eb4db18fda25).
- **Keyboard (desktop)** [O]: each option shows a small key-cap number (1, 2, 3…), and the a11y names include it ("gato 2"). **Number keys pick an option** and **Enter acts as Check, then as Continue**. On phone the numbers are hidden.
- **Option order is shuffled on every attempt** [O]: the same "cat" question listed its options differently across runs. Pressing "2" blindly picked a wrong answer.
- **Transition**: outgoing and incoming exercises briefly coexist in the a11y tree [O], so a slide or crossfade [I].

### Feedback sheet [O] (ev_d40d8f2513bf, ev_62596b370260)
Pressing Check replaces the footer with a coloured bottom sheet. The same button slot becomes Continue.
- **Correct**: pale green band, a round white badge with a green tick, a short green heading ("Nice job!"), a green Continue button, and the chosen card tinted green.
- **Incorrect**: pale red band, a red X badge, the heading "Correct solution:" followed by the right answer in plain text, and a red Continue button. The wrong card is not highlighted separately; the sheet does the work.
- Both sheets carry three small text actions: Too easy, Too difficult, Report. No explanation or grammar tip appeared for these word-picture items.
- All options become `disabled` after Check, so the learner cannot change the answer.
- **First mistake triggers a one-time explainer modal** [O]: it dims the page, shows a row of hearts with one now empty, says that each mistake costs one heart, and has a "Keep going" button. The heart counter in the header gets a white spotlight circle. **Skip did not cost a heart** (the count stayed at 5), but skipping the very first item still opened the explainer (ev_3761382fe1ab). On the second and later skips no modal appeared.
- Sounds and animation timing: [U]. Headless capture recorded no audio, and the DOM contained no `<audio>` element (sounds are probably loaded through JS [I]). The sheet was fully visible within 1.2 s of Check.

### End of lesson, home path, streak [U]
Not reached. Finishing needs correct answers to unknown, shuffled items, and every scripted run broke at a modal or a type change. Section 4 lists what remains open.

---

## 2. Exercise types reached

| Type | Layout | Interaction | Evidence |
|---|---|---|---|
| **Picture choice** ("Which one of these is X?") | 3 tall cards in a row (2+1 wrapped on phone), each with an illustration, a word and a key-cap number | Tap or number key selects (blue tint), then Check | ev_5b784d5ee9fd, ev_eb4db18fda25 |
| **Match pairs** | Two columns of 5 pill buttons (English left, target language right), numbered 1–0 | Tap one on each side to pair them; uses `button`s, not radios | ev_c842eb6df919 |
| **Select meaning** | A character with a speech bubble holding the word, then 3 full-width numbered rows | Same select-then-Check flow | ev_c842eb6df919 |

Word bank, translate-typing, listening and speaking exercises were **not reached** [U]. The first lesson introduced 5 words through three picture-choice items, then reviewed them with match pairs and a meaning check. Teach, then recall, then mix [O order, I intent].

---

## 3. Accessibility notes
- **Good** [O]: native `button` for course cards; `radiogroup`/`radio` with `aria-checked` and roving tabindex for choices; `progressbar` with min/max/now; real `h1` per exercise; disabled state exposed on Check and on options after answering; number-key shortcuts.
- **Gaps** [O]: the close X and back arrow are `button`s with **no accessible name** (just an img). The heart count is a bare "5" with no label. The typewriter question is read twice (the a11y tree shows the text duplicated). No `aria-live` region was found for the feedback sheet, so screen-reader announcement of right/wrong is [U]. The heart modal had no `role=dialog`/`aria-modal` in what I saw [I, weak].
- **Sizes** [O, from screenshots]: picture cards about 190x250 px on desktop and about 170x280 px on phone; onboarding option rows about 360x75 px; Continue/Check about 150x48 px on desktop. All are above 44 px. Body copy is roughly 16–17 px and headings about 24–32 px.
- **Reduced motion** [U]: runs used `no-preference`. The main CSS is external and I did not fetch it, so whether the typewriter and slide animations respect `prefers-reduced-motion` is unknown.
- **Theming** [O]: a root theme attribute plus about 80 named RGB colour tokens. Copy the token approach, not the values.

## 4. Front-end stack hints [I]
Hashed webpack-style chunks, a per-locale strings bundle, atomic class names and `data-test` hooks (`player-next`, `player-skip`, `challenge-choice`) suggest a React SPA. `analyze_web_bundle` was not run.

---

## 5. Pattern table

| Pattern | How Duolingo does it | Hookline scam-training version | Effort |
|---|---|---|---|
| Select → Check → sheet | Check stays disabled until a choice is made; the answer locks; a green or red bottom sheet takes over the footer; one big Continue | Same loop for every scam question; the sheet says "Safe" or "Scam" plus the reason | M |
| Correct-answer reveal | Wrong answers show the right answer in the sheet | Wrong answers show the real red flag, highlighted inside the fake message | S |
| Lesson header | X, a thick progress bar that moves on every answer, a life counter | X with a confirm step, a progress bar, and **no lives** by default (lives punish slower or older learners) | S |
| Picture choice | 3 large illustrated cards with key-cap numbers | "Which of these 3 texts is from your real bank?": three message-preview cards | S |
| Match pairs | Two numbered columns, tap a pair | Match the scam tactic to an example ("urgency" ↔ "account closes in 1 hour") | M |
| Tap the red flags | (no direct twin) | A fake SMS or email where each risky phrase or link is a tappable token, and Check reveals any missed ones | M |
| Guided onboarding | ~9 single-question screens, a speech bubble that reacts to each pick, Continue disabled until answered, no sign-up | 4–5 screens: who are you protecting, which channels scare you (calls, texts, email), daily minutes, start now; account only after the first lesson | M |
| Reactive guide bubble | The mascot's line changes the moment you pick an option | A friendly guide card gives a one-line reaction ("Text scams are the most common, good pick") | S |
| Daily goal rows | 4 rows: minutes per day + intensity word | 3 rows (2/5/10 min) with plain labels | S |
| Teach → recall → mix | New items introduced singly, then mixed into pairs and a meaning check | Show one red flag per card, then mix them into a "spot all" round | M |
| First-mistake explainer | A one-time modal explains the life system | A one-time, friendly "mistakes are how you learn here" tip, with nothing taken away | S |
| Keyboard shortcuts | Number keys pick; Enter checks and continues; hidden on phone | Same, plus visible focus rings and labelled icon buttons | S |
| Shuffled options | Order changes on every attempt | Shuffle, so learners can't memorise positions | S |
| Difficulty feedback | Too easy / Too difficult / Report under each answer | "Too hard / Report" lets the team tune the content | S |
| Voice practice (not seen) | (speaking exercises not reached) | Practice-call screen: the "caller" speaks, the learner picks hang up / ask a question / verify | L |

## 6. Limitations and unknowns
- Not observed: the end-of-lesson summary (XP, accuracy, time), streak prompts, the "practise mistakes" offer, the sign-up wall, the home path (units, nodes, locked states), and the practice hub. Each run is a fresh temp profile, so state never carried over, and finishing a lesson needs correct answers to shuffled items.
- Not observed: word-bank, typing, listening and speaking exercises; all sounds; motion timings beyond "under 1.2 s"; reduced-motion handling; heart-loss rules beyond the first mistake (a wrong Check took 5 → 4, Skip took nothing).
- Phone run: only the first exercise. That exercise had no Skip button on phone; whether Skip appears later, or the layout differs on other types, is unknown.
- One scripted guest session per run; A/B tests may vary the flow.
