# What makes people better at resisting scams: evidence notes

Research notes for Hookline, October 2026. Where I could only open an abstract, press release or secondary summary, the bullet says so. Effect sizes appear only where I read them in the source.

## 1. Phishing training in practice

- Ho, Liu, Mirian, Voelker et al. ran an 8-month randomised trial with ten simulated campaigns sent to more than 19,500 hospital staff. Recent annual training had no significant link to failure rates. Embedded training lowered the average failure rate by 1.7 percentage points. How hard the lure was mattered far more: some lures caught 1-2% of staff and others more than 30%. Over 56% of staff clicked at some point. ([IEEE S&P 2025, full text read](https://sysnet.ucsd.edu/~voelker/pubs/phishtrain-oakland25.pdf))
- People skipped the training. Between 37% and 51% of training sessions had zero engagement, the median session lasted 0-10 seconds, and in every arm 75% of sessions ended within 48 seconds. Fewer than 24% of staff completed the material. (same paper, Table 3)
- Interactive training beat static pages. Staff who finished interactive training were 19% less likely (relative) to fail the next lure, though the authors say this may be a selection effect. Static training was negatively correlated with later outcomes. (same paper)
- Lain et al. (ETH Zurich) studied 4,554 employees over 6 weeks and interviewed 25. Training helped through its nudge, the periodic reminder that phishing exists, and hardly at all through its content, which staff rarely read. Training delivered the next day worked as well as immediate training. Rewards did not help. They describe phishing as "an attention problem, rather than a knowledge one", and some staff came out overconfident. ([CCS 2024 / arXiv 2409.01378, full text read](https://arxiv.org/abs/2409.01378))
- Ho et al. also summarise Lain's earlier 15-month study of 14,000 employees, which found no positive effect from embedded training and some evidence of harm. (I did not open that paper.)
- Sommestad and Karlzén's meta-analysis of 48 field experiments lists training as one factor that affects susceptibility but warns about weak controls in the underlying studies. ([eCrime 2019](https://docs.apwg.org/ecrimeresearch/2019/Nov15_HenrikKarlzen.pdf), abstract only)

## 2. Inoculation and prebunking

- Roozenbeek, van der Linden et al. made five short videos on manipulation techniques and tested them in six RCTs (n=6,464) and a YouTube field study (n=22,632). Recognition of the technique rose about 5% on average, measured roughly 18 hours after viewing. ([Science Advances 2022](https://www.science.org/doi/10.1126/sciadv.abo6254); I read the [Cambridge summary](https://www.cam.ac.uk/stories/inoculateexperiment) only)
- Bad News game: with regular testing the effect held for at least 3 months. Without testing it decayed over 2 months until it was no longer significant. Samples were 151, 194 and 170. (Maertens et al., [JEP: Applied 2021](https://www.repository.cam.ac.uk/handle/1810/312077), abstract only)
- Five longitudinal experiments (n=11,759): text and video inoculation stayed effective for one month, game-based effects decayed faster, and memory-boosting "booster" sessions countered the decay. (Maertens et al., [Nature Communications 2025](https://www.memlab.psychol.cam.ac.uk/pubs/Maertens2025%20NatureComms.htm), abstract only)
- A 19-second Instagram prebunk ad improved identification of emotional manipulation by 21.4 percentage points, and the gap was still there at five months. The caveats are large: about 1% of users answered the poll, assignment was by birth month, and the test was one headline. ([HKS Misinformation Review 2026](https://misinforeview.hks.harvard.edu/article/prebunking-misinformation-techniques-in-social-media-feeds-results-from-an-instagram-field-study), full article read)
- A 2023 meta-analysis (42 studies, 42,530 people) found a small gain in telling true from false content (d=0.20). A 2025 letter disputes which studies it included. A Singapore replication of Bad News failed. ([JMIR 2023](https://jmir.org/2023/1/e49255/PDF), [critique](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12428163/), [Wong & Wu 2023](https://ideas.repec.org/a/taf/jriskr/v26y2023i10p1037-1052.html); search summaries only)
- I found no inoculation trial aimed at scams or fraud. The evidence is all about misinformation.

## 3. Older adults and fraud

- DeLiema and the US Postal Inspection Service randomised known older mail-fraud victims. Over 4 months, a single warning letter cut revictimisation by 8.6% and a letter plus five more mailings two weeks apart cut it by 22.4%, measured from real detained mail. The abstract does not say whether these are relative or absolute reductions. ([RTI abstract](https://www.rti.org/publication/a-fraud-awareness-mail-campaign-significantly-reduces-rates-of-re), [NAPSA brief](https://napsa-now.org/wp-content/uploads/2025/02/R2P-Webinar-brief_Langton-and-DeLiema.pdf))
- ROLESafe (n=144, older adults in China) tested learning roles with GPT-4o dialogues. Fraud-cue F1 scores were Helper 0.85, Experiencer 0.81, Observer 0.76 and control 0.66. Helper and Experiencer differed significantly from control; Observer did not. Self-efficacy did not differ between groups. At one month (n=84) there were no group differences. ([arXiv 2601.12324](https://arxiv.org/abs/2601.12324), full text read)
- A 2024 MobiSys demo simulated fraud calls with sensing and personalised feedback. Of 28 older participants, 81% said they intended to adopt protective steps. That is stated intention, not behaviour. ([ACM](https://dl.acm.org/doi/10.1145/3643832.3661833), abstract snippet only)
- Chung and Yeung's anti-scam board game (55 vs 54 participants) raised fraud-prevention self-efficacy and scam awareness, and lowered perceived susceptibility, both immediately and at two weeks. (J Elder Abuse & Neglect 35(2-3), 2023; secondary summary only)
- In the Rush Memory and Aging Project, 935 people without dementia were followed for about 6 years. Low scam awareness went with roughly twice the risk of Alzheimer's dementia and mild cognitive impairment. This is correlational. (Boyle et al., Annals of Internal Medicine 2019; [Rush summary](https://www.rushu.rush.edu/news/scam-susceptibility-may-early-sign-dementia))
- Loneliness: in the Health and Retirement Study (n=4,400), 4.5% reported fraud over 5 years. Among people with the highest depression and lowest social-needs fulfilment the rate was 14%, against 4.1% for everyone else. (Lichtenberg et al. 2013, [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4824611), summary only) Rush data also link loneliness and low well-being to susceptibility ([Sur, DeLiema & Brown](https://crr.bc.edu/lonely-seniors-are-more-vulnerable-to-fraud/)).

## 4. Why people comply

- Stajano and Wilson list seven principles scammers exploit: distraction, social compliance (authority), herd, dishonesty, deception, need and greed, and time pressure. They argue systems should be designed around these instead of blaming "gullible users". ([CACM 2011 / project page](https://www.cl.cam.ac.uk/~fms27/scams/))
- Langenderfer and Shimp argue that a strong visceral response (greed, fear, need) cuts scrutiny of the message, and that older, isolated people can be vulnerable even without one. ([Psychology & Marketing 2001](https://longevity.stanford.edu/consumer-vulnerability-to-scams-swindles-and-fraud-a-new-theory-of-visceral-influences-on-persuasion), summary only)
- Knowing more is not the same as resisting. In the 2006 NASD study (165 victims, 150 non-victims), investment-fraud victims scored higher than non-victims on eight financial literacy questions. They were also more willing to listen to pitches from strangers. The authors recommend teaching persuasion tactics. ([FINRA Foundation report](https://www.finrafoundation.org/sites/finrafoundation/files/investor-fraud-study.pdf), full text read) Overconfidence in one's own financial knowledge is associated with victimisation ([Gamble et al. 2014](https://ideas.repec.org/p/crr/crrwps/wp2014-13.html), abstract only).
- Forewarning past victims cut outright acceptance of a mock scam pitched 2 or 4 weeks later. A warning about the same scam lost effect over time; a warning about a different scam did not. (Scheibe et al. 2014, [Stanford summary](https://longevity.stanford.edu/forewarning-reduces-fraud-susceptibility-in-vulnerable-consumers))
- Burke et al. randomised 2,000 US adults to a 3-minute video or text on fraud techniques, or to nothing. Interest in fraudulent offers fell immediately, while interest in legitimate ones barely moved. By 6 months the effect was gone unless people got a reminder at 3 months, in which case it held. Text-only education may have backfired for people with lower cognitive ability or financial literacy; video showed no such split. ([FINRA/USC working paper 2021](https://gflec.org/wp-content/uploads/2021/04/Burke-Kieffer-Mottola-Perez-Arce-Can-Educational-Interventions-Reduce-Susceptibility-to-Financial-Fraud-CB2021.pdf), full text read)

## 5. Voice scams and cloned voices

- Listeners (n=529) caught speech deepfakes 73% of the time, and training raised that by only a few points. The fakes were made with older methods. (Mai et al., [PLOS ONE 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10395974/), abstract and press only)
- Listeners judged an AI clone to be the same person as the real speaker about 80% of the time, and spotted AI voices only about 60% of the time. (Barrington, Cooper & Farid, [Scientific Reports 2025](https://arxiv.org/abs/2410.03791v2), abstract only)
- ElevenLabs clones built from under five minutes of audio were judged human 58% of the time; real voices were judged human 62% of the time. (Lavan et al., PLOS ONE 2025; figures from [press coverage](https://www.theregister.com/2025/10/09/voice_clone_detection_study/))
- Vishing training evidence is thin. In a CHI pilot, 47.6% of the persuasion-trained group and 55.2% of controls complied with a surprise call eight days later, which was not significant (n=50 answered; underpowered). People who resisted noticed the unusual channel and questioned the caller. The paper reports that an earlier awareness campaign worked for about a week and that a 3-month warning had no effect. ([Hashmi et al., CHI EA 2023](https://web.lums.edu.pk/~mobin/publications/2023/vishing-CHI23.pdf), full text read)

## 6. Learning science

- Testing versus restudy: g=0.50 [0.42, 0.58]. With feedback, g=0.73; without, 0.39. (Rowland, Psychological Bulletin 2014, [full text read](https://courseware.epfl.ch/assets/courseware/v1/fdde2f0aa590bf3b1324077a6bf1540c/asset-v1%3AEPFL%2BDEMO%2B2020%2Btype%40asset%2Bblock/Rowland2014-meta-analysis.pdf))
- Practice testing beat restudy and all other comparisons across 272 effect sizes (15,472 participants), with g=0.61 per secondary sources. ([Adesope et al. 2017](https://journals.sagepub.com/doi/10.3102/0034654316689306), abstract only)
- Spacing: the best gap between reviews grows with how long you need to remember. It was about 20-40% of a 1-week retention interval and 5-10% of a 1-year interval. ([Cepeda et al. 2006](https://pubmed.ncbi.nlm.nih.gov/16719566/); [Cepeda et al. 2008](https://pubmed.ncbi.nlm.nih.gov/19076480/), abstracts)
- Feedback timing: the advantage of delayed feedback shows up mostly in lab studies, not in normal teaching (Kulik & Kulik 1988, secondary summary only). Lain found next-day training as good as immediate.
- All of this concerns remembering material. None of it shows that people resist a live scam.

## What this means for Hookline features

| Feature | Evidence | Strength |
|---|---|---|
| Scheduled repeat sessions (boosters), not one-off lessons | DeLiema (22.4% vs 8.6%), Burke (gone at 6 months without reminder), Maertens 2021/2025, Scheibe decay | Strong |
| Quizzes that ask for recall, with feedback straight after | Rowland (g=0.73 with feedback), Adesope | Strong for memory, unproven for behaviour |
| Lessons under 2 minutes, interactive, never a wall of text | Ho (75% of sessions under 48 s; interactive beat static), Lain | Strong |
| Teach tactics (authority, urgency, secrecy, payment method) across scam types, alongside this week's specific scam | Scheibe (different-scam warning lasted), NASD, Burke, inoculation studies | Moderate |
| Voice practice teaches "hang up and call back on a number you already know", not "listen for a fake voice" | Mai, Barrington, Lavan (near chance by ear); Hashmi (resisters noticed channel and questioned the caller) | Strong on the "why", weak that practice changes behaviour |
| Practice as the target or as a helper coaching someone else; passive watching is weaker | ROLESafe (Observer not significant; nothing at 1 month) | Weak to moderate |
| Audio and video options plus plain language, especially for older users | Burke (text-only may backfire for lower literacy) | Moderate |
| Weekly nudge is part of the product, not a side feature | Lain (benefit came from reminders), Ho | Moderate |
| No shame, no points, no penalties | Lain (rewards did not help, failures felt judged) | Moderate |
| Never show a "scam-proof" badge; show which weak spots are due for review | NASD, Gamble, Lain (knowledge and confidence do not equal resistance) | Moderate |
| "Practise with a family member" or share-a-lesson option | Lichtenberg, Sur/DeLiema (loneliness as a risk factor) | Weak: correlational, no app trial |
| Progress charts compare items of the same difficulty | Ho (lure difficulty ranged from 1-2% to over 30% and swamped the training effect) | Strong |
| Repeat spacing of roughly 2 days, 1 week, 3 weeks, then monthly | Cepeda (expanding gaps fit longer retention) | Moderate; not tested on scams |

## Claims we must NOT make

- "Hookline reduces scam losses" or any percentage. Nobody has studied Hookline, and the best trials found modest effects that fade.
- "Proven" or "clinically shown". The fair wording is "designed around published research".
- "Learn to tell a cloned voice by ear." People are close to chance at this.
- "Prebunking is proven against scams." The studies cover misinformation; using it for scams is our assumption.
- "Our practice calls are proven to work." Vishing training trials are few, small and mostly null.
- "Spaced repetition protects you from fraud." It improves recall. Only reminder trials (Burke, DeLiema) touch fraud outcomes.
- "Interactive training cuts clicks by 19%." That figure is relative, covers completers only and may be selection.
- Anything suggesting Hookline screens for dementia or cognitive decline. The Rush link is correlational, and the app must not diagnose.
- "Older people are gullible." Victims often know more than non-victims, and the tactics work on every age group.
- Treating simulated-user curves as learning. They show the profile finding planted weak spots, not that people learned.
- "Phishing training doesn't work" as a blanket statement. The data are about forced, static workplace training.

## Sources

Opened in full: Ho et al. 2025 (IEEE S&P); Lain et al. 2024 (arXiv 2409.01378); Deng et al. 2026 (arXiv 2601.12324); van der Linden et al. 2026 (HKS Misinformation Review); Burke et al. 2021 (FINRA/USC); NASD Investor Fraud Study 2006; Hashmi et al. 2023 (CHI EA); Rowland 2014 (Psychological Bulletin); DeLiema NAPSA brief.

Abstract, press release or secondary summary only: Roozenbeek et al. 2022 (Science Advances); Maertens et al. 2021 and 2025; JMIR 2023 inoculation meta-analysis and its 2025 critique; Wong & Wu 2023; Sommestad & Karlzén 2019; DeLiema RCT abstract (RTI); MobiSys 2024 demo; Chung & Yeung 2023; Boyle et al. 2019; Lichtenberg et al. 2013; Sur, DeLiema & Brown; Gamble et al. 2014; Stajano & Wilson 2011; Langenderfer & Shimp 2001; Scheibe et al. 2014; Mai et al. 2023; Barrington et al. 2025; Lavan et al. 2025; Adesope et al. 2017; Cepeda et al. 2006 and 2008; Kulik & Kulik 1988.

Links are inline above.
