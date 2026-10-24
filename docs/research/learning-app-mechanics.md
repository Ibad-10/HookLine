# Learning-app mechanics Hookline can copy

Research notes, Sat 24 Oct 2026. Numbers in brackets point to Sources at the bottom. "Secondary" means the source is not the original study or company.

## Summary table

| Mechanic | What it is | Hookline version | Evidence | 30-hour build |
|---|---|---|---|---|
| Real or scam? | Multiple choice (Duolingo, Kahoot) | Show one message. Ask "Scam or real?", then "What would you do next?" About a third of items are real messages. | A game that mixed real and fake sites cut false alarms from 30% to 14%; existing reading material did not (small study, 14 per group) [23]. | Must |
| Tap the red flags | Spot-the-error / image hotspot | Fake text or email with tappable phrases. Tap each warning sign, then see every flag with a one-line reason. | Phil gave feedback on every pick and an end-of-round review sheet, which players spent a long time on [23]. | Must |
| Match the trick | Tap the pairs, Quizlet Match | Pair a tactic ("rush", "keep it secret", "pay by gift card") with an example line. No clock. | Retrieval practice [17]. Quizlet adds a time penalty per miss [29]; leave that out. | Should |
| Listen and choose | Duolingo listening, DuoRadio [26] | Play a 20-second voicemail (pre-made ElevenLabs audio). Pick scam or real, then the flag. Replay and slow buttons. | Given control, older listeners pick slower speech rates than younger ones [34]. | Should |
| Practice call | Duolingo Max Video Call and Roleplay [25] | Branching voice call. Afterwards, a transcript with the key moments marked. | Video Call shows a transcript after the call; Roleplay gives feedback after, not during [25]. | Must |
| Worked example | Fully explained example before practice | First card of each lesson: one fake message with every flag labelled. | Worked examples beat solo problem-solving for beginners (overview) [22]. | Must |
| Explained feedback, straight away | Right or not, plus why | One sentence on the clue ("the link goes to a different site"). Never "Wrong!". | Feedback has large effects, but type matters; praise alone does little [21]. | Must |
| Mistakes review | Duolingo Practice Hub "Mistakes" [28] | "Worth another look": missed items come back next session. | Retrieval plus spacing [17][18]. | Must |
| Spaced repeats | Babbel Review [16], Anki [15], Duolingo HLR [11] | Box ladder per scam category (see below). | Spacing meta-analysis [18]. HLR A/B test: +12% overall activity [11]. | Must |
| Interleaving | Mix topics within a session | Each session mixes about 1 weak category to 2 known ones, shuffled. | Interleaved study: 59% vs 36% on new items [19]; holds for adults averaging 77 [20]. | Must |
| Daily goal | Small daily target | "Today's 3 minutes": one session, then a clear "done for today". | No study found. It is spec goal 1, and a fixed small session gives the streak something finishable to count. | Must |
| Streak | Days in a row [1] | Small counter on Home. Missed days are never announced. | 7-day-streak users are 3.6x more likely to finish a course (correlation only) [1]. Broken streaks lower later use [2]. | Should |
| Streak freeze / repair | Keep the streak through a missed day | Two free freezes, applied on their own. A missed day can be repaired by doing a review. | Freezes: +0.38% daily active learners [1]. Repair softens the drop after a break [2]. | Should |
| Story | Duolingo Stories; Phil's story guide [23] | Five-panel story of this week's scam with two questions part-way through. | Story-based guide was one of Phil's three design rules [23]. | Nice |
| Order the steps | Duolingo word-bank arranging | Put "hang up, find the real number, call back" in order. | Retrieval practice [17]. | Nice |
| Difficulty target | Birdbrain aims at about 70% success [12] | Prefer items the user will probably, but not surely, get right. | Duolingo practice; not peer-reviewed [12]. | Nice |
| Reminder | Push or email | One opt-in reminder at a time the user picks. Plain wording, varied text. | Tuned reminders gave +0.5% daily users and +2% new-user retention [10]. | Nice |
| Practice buddy | Duolingo Friend Streak [3] | Share with one family member. Both see only "you both practised today". | +22% daily lesson completion, observational [3]. People 75+ prefer working together to competing [8]. | Nice |
| Badges | Achievements | Few, private, skill-based ("Spotted 10 fake delivery texts"). | People 75+ called badges and points meaningless, and visibility added pressure [8]. | Nice |
| Path map | Linear unit map | Plain list of categories with progress dots. | No study found. | Nice |
| XP / points | Points per lesson | Skip, or keep private. | Points and leaderboards linked to "gamification misuse" [5]. | Skip |
| Hearts / lives | Lose a life per mistake | Do not copy. Mistakes cost nothing. | Duolingo began replacing hearts with "energy" in 2025 to stop penalising mistakes (secondary) [9]. | Avoid |
| Leagues | Weekly public XP ranking [4] | Do not copy. Private "you vs your last 4 weeks" chart. | Leaderboard and badge course: lower motivation, satisfaction and exam scores [6]. Duolingo says leaderboards "aren't for everyone" [4]. | Avoid |
| Perfect lesson | Bonus for zero mistakes | Do not copy. Say "You caught 4 of 5 flags". | No study found; it rewards playing safe over learning. | Avoid |
| Timed rounds | Kahoot speed scoring | No timers. Kahoot itself offers an "Accuracy experience" that scores correctness over speed, and lets hosts remove timers [30]. | WCAG 2.2.1 Timing Adjustable [31]. | Avoid |

## Exercise formats

Every format above works on the same content: a fake message, call or web page built from a Learner summary. Two rules apply to all of them.

1. Mix in real messages and score false alarms. In the Anti-Phishing Phil study, false alarms rose in the group that read existing training material and fell in the game group [23]. Someone who calls everything a scam will also ignore their real bank. Track both misses and false alarms per category.
2. Use fictional brands only, such as "Parcelly delivery" or "Northgate Bank". The lessons teach the clue: a mismatched link, a rush, a request for a code.

## Habit mechanics and the no-shaming rule

These mechanics clash with the anti-goals: leagues, public profiles, XP rankings, hearts, "perfect lesson", and broken-streak messages ("You lost your 12-day streak!"). Safe versions are private personal-best charts, a cooperative practice buddy, freezes that apply on their own, and fixed wording ("Not quite. Here's the clue" instead of "Wrong"; "Worth another look" instead of "Mistakes").

The evidence on gamification overall is mixed. A meta-analysis found positive effects on learning (g = 0.49), but effects on motivation and behaviour were less stable in the more rigorous studies [7]. Most of the documented harm comes from competitive pieces [5][6][8].

A randomised trial with more than 19,500 employees found that annual and embedded phishing training made little measurable difference [24]. Hookline should measure itself honestly (held-out set, spec section 8) and avoid claiming protection it cannot show.

## Learning science

- Retrieval practice: being tested beat restudying at 2 days and at 1 week, although restudying made people feel more confident [17]. Every lesson ends in questions.
- Spacing: the best gap between reviews grows with how long you need to remember [18].
- Interleaving: scam spotting is category learning ("which kind of scam is this?"), which is where interleaving has been shown to help. In Kornell and Bjork's study, 78% of people did better with interleaving, and 78% still rated blocked study as at least as good [19]. Older adults showed the same benefit [20].
- Feedback: comments on the task (which clue was missed) work better than praise [21].
- Worked examples: show a fully explained case before asking the user to find the flags themselves [22].

### Scheduling algorithms

- SM-2: the ease factor starts at 2.5; intervals are 1 day, 6 days, then the last interval times the ease. It needs a 0 to 5 self-grade after each review [13]. Older users would find that awkward, and Hookline already knows right or wrong in code.
- HLR (Duolingo): recall chance p = 2^(-days since last practice / half-life), with the half-life learned by regression on millions of reviews [11]. There is no data to train it this weekend.
- FSRS: tracks stability, difficulty and recall chance per card, with an optimiser fitted to review history. A TypeScript library, ts-fsrs, exists [14], which makes it a sensible later upgrade.
- Fixed ladder (Leitner style): Babbel uses next day, 4, 7, 14 and 60 days, then 6 months [16].

### Recommendation: fixed ladder, about 2 hours to build

Store `box` (0 to 4) and `due_at` per user and scam category. Intervals: box 0 = later in the same session, 1 = 2 days, 2 = 7 days, 3 = 21 days, 4 = 30 days, matching spec section 6. Correct answer: box goes up by one. Wrong answer: box drops to 1, and the item is asked once more later in the same session, like Anki's learning steps [15]. To build a session, take the most overdue categories, fill to about 1 weak to 2 known, then shuffle. For the My progress screen, show "next repeat in N days", and optionally rank due items by p = 2^(-days since / interval) [11]. The 200 simulated users in spec section 8 can run on this directly.

## Accessibility for older users

- Text: a large-text setting; the layout still works at 200% zoom (WCAG 1.4.4); contrast of at least 4.5:1, with 7:1 as an option (1.4.3, 1.4.6) [31]. Kahoot supports 200% scaling and a high-contrast theme [30].
- Tap targets: at least 44 x 44 CSS pixels (WCAG 2.5.5) [32]. A review citing Jin et al. gives 11.43 mm as a minimum for older users, close to 44 CSS pixels, with 3.17 to 12.7 mm gaps between buttons [33]. Phrases inside a fake message make small targets, so make each one a padded chip and offer a checklist view as well.
- Audio: replay and slow buttons on every clip. Duolingo's turtle button replays more slowly with gaps between words [27]. Add a global speed setting [34], a transcript for every clip and call (WCAG 1.2) [31], and a "no audio" setting, since Duolingo lets users turn listening exercises off [27].
- Time: no timers (WCAG 2.2.1) [31].
- Colour: never use colour alone for a flag; add an icon and a word (WCAG 1.4.1) [31].
- Read aloud: Kahoot reads questions and answers aloud [30]; the browser's built-in speech synthesis can do the same.
- Consistency: keep navigation in the same place on every screen, and write clear error text (WCAG 3.2.3, 3.3.1) [31].

## Sources

1. Duolingo, "How the streak builds habit". https://blog.duolingo.com/how-duolingo-streak-builds-habit
2. Silverman & Barasch (2023), "On or Off Track: How (Broken) Streaks Affect Consumer Decisions", Journal of Consumer Research. https://udspace.udel.edu/handle/19716/34160
3. Duolingo, "Product lessons: Friend Streak". https://blog.duolingo.com/product-lessons-friend-streak/
4. Duolingo, "Leagues and leaderboards". https://blog.duolingo.com/duolingo-leagues-leaderboards/
5. Hadi Mogavi et al. (2022), "When Gamification Spoils Your Learning", L@S '22. https://arxiv.org/abs/2203.16175
6. Hanus & Fox (2015), Computers & Education 80. https://doi.org/10.1016/j.compedu.2014.08.019
7. Sailer & Homner (2020), "The gamification of learning: a meta-analysis", Educational Psychology Review. https://link.springer.com/article/10.1007/s10648-019-09498-w
8. Altmeyer, Lessel & Krüger (2018), "Investigating Gamification for Seniors Aged 75+", DIS '18. https://www.dfki.de/web/forschung/projekte-publikationen/publikation/9808
9. Android Authority (secondary), on Duolingo's energy system. https://www.androidauthority.com/quitting-duolingo-energy-system-3599842/
10. Yancey & Settles (2020), "A Sleeping, Recovering Bandit Algorithm for Optimizing Recurring Notifications", KDD. https://research.duolingo.com/papers/yancey.kdd20.pdf
11. Settles & Meeder (2016), "A Trainable Spaced Repetition Model for Language Learning", ACL. https://aclanthology.org/P16-1174/ and https://blog.duolingo.com/how-we-learn-how-you-learn
12. Duolingo, "Introducing Birdbrain". https://blog.duolingo.com/learning-how-to-help-you-learn-introducing-birdbrain ; 70% quote: https://venturebeat.com/ai/how-duolingo-uses-ai-in-every-part-of-its-app
13. SuperMemo SM-2 description. https://en.wikipedia.org/wiki/SuperMemo
14. FSRS algorithm wiki. https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm ; ts-fsrs: https://github.com/open-spaced-repetition/ts-fsrs
15. Anki manual, deck options. https://docs.ankiweb.net/deck-options.html
16. Babbel, spaced repetition. https://www.babbel.com/spaced-repetition-language-learning
17. Roediger & Karpicke (2006), "Test-Enhanced Learning", Psychological Science. https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf
18. Cepeda et al. (2006), "Distributed practice in verbal recall tasks", Psychological Bulletin. https://pubmed.ncbi.nlm.nih.gov/16719566/
19. Kornell & Bjork (2008), "Learning Concepts and Categories", Psychological Science. https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Kornell_Bjork_2008_PsychScience.pdf
20. Kornell, Castel, Eich & Bjork (2010), "Spacing as the friend of both memory and induction in young and older adults", Psychology and Aging. https://castel.psych.ucla.edu/wp-content/uploads/sites/111/2016/11/SpacingInduction.pdf
21. Hattie & Timperley (2007), "The Power of Feedback", Review of Educational Research. https://www.uky.edu/~gmswan3/575/Hattie_Timperly_2007.pdf
22. Worked-example effect, overview citing Sweller & Cooper (1985). https://en.wikipedia.org/wiki/Worked-example_effect
23. Sheng et al. (2007), "Anti-Phishing Phil", SOUPS. https://cups.cs.cmu.edu/soups/2007/proceedings/p88_sheng.pdf
24. Ho et al. (2025), "Understanding the Efficacy of Phishing Training in Practice", IEEE S&P. https://sysnet.ucsd.edu/~voelker/pubs/phishtrain-oakland25.pdf
25. Duolingo, "Duolingo Max". https://blog.duolingo.com/duolingo-max
26. Duolingo, "Our approach to listening skills". https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-listening-skills/
27. Duolingo, "Learning with hearing aids". https://blog.duolingo.com/learning-with-hearing-aids/
28. Duolingo, "Guide to the Practice Hub". https://blog.duolingo.com/guide-to-duolingo-practice-hub/
29. Quizlet Help Center, Match. https://help.quizlet.com/hc/en-us/articles/360031183611
30. Kahoot, accessibility. https://kahoot.com/accessibility/
31. W3C WAI, "Developing websites for older people". https://www.w3.org/WAI/older-users/developing/
32. W3C, WCAG 2.2 Understanding 2.5.5 Target Size (Enhanced). https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
33. Jin, Plocher & Kiff (2007), "Touch Screen User Interfaces for Older Adults: Button Size and Spacing". https://doi.org/10.1007/978-3-540-73279-2_104 ; W3C research summary: https://www.w3.org/WAI/GL/mobile-a11y-tf/wiki/Summary_of_Research_on_Touch/Pointer_Target_Size
34. Wingfield & Ducharme (1999), self-paced speech rates in young and older adults, Journal of Gerontology. https://psychsoc.gerontologyjournals.org/cgi/content/abstract/54/3/P199
