# Google Jigsaw phishing quiz: UI notes (partial)

The REA study was stopped early to save tokens (Ibad, 24 Oct). These notes come from the
screenshots it captured (desktop, tall and phone viewports) before it stopped. The Duolingo
Max call screen was not studied.

## What the quiz does

- **Header:** quiz name on the left, "Question 1/10" progress on the right. No score is shown
  during the quiz.
- **Question screen:** a short headline naming the message ("Let's start with this ... email"),
  one tip line under it ("check link addresses by hovering or long-pressing; none of the links
  work"), then two big buttons side by side, "Phishing" and "Legitimate". The answer buttons
  sit *above* the message, so they are in view without scrolling.
- **Message mock:** a realistic email card under the buttons: sender name and address,
  timestamp, body, a fake document preview and an "Open" button. Links and addresses can be
  inspected (hover or long-press) but go nowhere.
- **Feedback screen:** same layout. The headline becomes "Correct! This is a phishing email."
  with "Correct!" in green, and one or two plain sentences naming the tell ("You must have
  spotted the look-alike address"). A "Show me" button then highlights the red flags on the
  same message, so the explanation points at the evidence.
- **Tone:** friendly and calm. Wrong answers are explained the same way, with no penalty.

## What Hookline takes (patterns only, own code and look)

| Pattern | Hookline version | Effort |
|---|---|---|
| Answer buttons above the message | "Real or scam?" buttons above the fake text/email bubble | S |
| Inspectable but dead links | Tap or long-press a link in the mock to see where it really goes (H1 "Inspect the link") | S |
| Feedback headline plus one-line reason | FeedbackSheet: kind headline, the trick's name, one-line why | S |
| "Show me" highlights flags on the same message | After any answer, highlight the red-flag spans in the message, each with its reason | M |
| Progress "Question n/N", no running score | Progress bar in lessons; no score shown mid-lesson | S |
