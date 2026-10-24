# Hookline: technical feasibility notes

Researched Sat 24 Oct 2026 for the Night Shift build (code freeze Sun 25 Oct, 10:00 London). Every claim below has a source at the end. Where the docs say nothing, these notes say so.

## 1. Mubit

**Can adapters be called from code?** No. The Model IDs guide says: "There is no Mubit model ID: you can't send a call to an adapter by naming it as the model." The only way to use an adapter is **Try models** in the console. Each organisation gets a daily number of Try models calls, an adapter can be started 3 times per UTC day, and the first start "can take a few minutes" (the page retries every 15 s for up to 20 minutes). The Requests list does have a **Served by** column and filter, which suggests serving is planned, but nothing documents it.

**How long does a training run take?** The docs don't say. A task moves through `Collecting examples`, `Reviewing examples`, `Training` and `Testing`. By default it first trains at 25 kept examples, and not every call is kept. There is a daily training limit that resets at 00:00 UTC and a pause between trainings, with no numbers published. Mubit never retries a failed training on the same examples and there is no retry button, so recovery means sending new calls. A version passes only if it matches the provider model closely enough; the console line reads "Matched {a}% of your provider model's answers on {n} test cases · needs {need}%".

**Is there an API for task stats?** No. The API reference lists only the provider pass-through paths (OpenAI, Anthropic, Gemini, `/compat/{openrouter|groq|together|mistral}`), and admin paths return `403 admin_path_refused`. A "Read only" key type exists that "reads this project's records", but no read endpoint is documented. The console shows calls, errors and response time per task, tokens per call, "Where the time went" (Mubit vs model), and each adapter version's agreement figure. It shows no cost figures anywhere.

Recommendation: build the on-screen numbers ourselves. Time each call, read `usage` tokens from the response, multiply by a small price table, and store the `x-middleware-request-id` header (`mreq_…`) so any number can be traced to the console. Show adapter agreement from a console screenshot, labelled as such.

**Is Sapling served on the gateway?** No. The gateway serves provider models only. The model card says the model "isn't deployed by any Inference Provider". It is a 23B pruned Qwen3-30B-A3B MoE, about 46 GB in BF16, and its reference runtime is an H200 (97 ms median latency). The demo Space runs on a free CPU and returns canned examples unless a private `BANYAN_API_URL` secret is set. Recommendation: don't plan on it. Ask Mubit staff whether they host an endpoint for the hackathon.

**Does `x-middleware-record: off` keep data out?** Out of Mubit, yes. Out of the provider, no. Mubit "keeps no request or answer for such a call, and never lists it". `metadata` (the same as `x-middleware-store: false`) keeps a record of the call without its content, and `off` also drops the task fingerprint, so the call cannot join a task. Mubit never forwards `x-middleware-*` headers. The call still goes to OpenAI, Anthropic or Groq, and their retention rules apply. The docs give no retention period for normal recorded calls.

Recommendation: mask in code first, then send the masked text with normal recording, so the Gatekeeper's LLM check becomes a second trainable task. Keep `off` for anything that might still hold raw user text.

**Is there a rating or outcome API?** Not for the gateway. Each call in **Requests** has a **Rate this reply: Good / Bad** control in the console, and the docs don't say what ratings do. Mubit also publishes a separate memory SDK (`@mubit-ai/sdk` 0.13.2 on npm, `mubit-sdk` on PyPI) with `recordOutcome` and `feedback`, used in `MubitLabs/demo`. That is the memory engine. Its docs pages now return 404, and nothing links it to adapter training.

**Tips that affect our design** (Tasks and sessions guide):
- Instructions decide the task. Numbers, dates and IDs in the system prompt don't split a task, but any other changed word does, so per-user text must go in the user message. `temperature` and `max_tokens` don't matter.
- Send `metadata.session_id` (OpenAI) per learner or call. Mubit sets test cases aside by session.
- The starter credit serves a fixed model list (the docs show `gpt-6-luna`, `claude-haiku-4-5`, `gemini-3.8-flash`) and caps calls in flight per project (`429 starter_credit_busy`). Groq needs our own key unless the console lists it.
- Clocks go back at 02:00 tonight, so 00:00 UTC is 01:00 BST and the 10:00 freeze is 10:00 UTC. Today's training limit and Try models starts reset at 01:00 local.

**Ask Mubit staff:** Can adapters be served by API this weekend? Do Bad ratings or `record: off` affect training? What are the daily training limit and the pause? Does a read-only key have a stats endpoint? Is Sapling hosted anywhere?

## 2. ElevenLabs

**Pre-generating clips.** Use a build-time script that calls TTS once per script line and writes MP3s to `/public/audio`. Static files cost nothing per play and come from the CDN with no latency. Model choice:
- `eleven_v3` or `eleven_v4` for the most expressive scam-caller voice, at $0.08 per 1K characters. v4 has a 10K character limit per request. Latency doesn't matter for pre-generated audio.
- `eleven_v4_turbo` (~100 ms, audio tags) or `eleven_flash_v2_5` (~75 ms), at $0.04 per 1K characters, for live off-script replies. Use the same voice ID for both kinds of line so the switch isn't obvious.
- Pass `previous_text` and `next_text` for smoother joins and a fixed `seed` for repeatable output.

Cost: 10 scenarios × 30 lines × 120 characters is 36K characters, about $3 on v4. The free plan includes only 10K v4 or 20K Flash characters. Starter ($6) includes 75K/150K.

**Slow-audio mode.** The API `speed` setting runs from 0.7 to 1.2 but "is not available for the Eleven v3 model". Setting `audio.playbackRate = 0.8` in the browser is simpler: it keeps pitch by default and needs no second set of clips.

**Speech-to-text.** Scribe v2 Realtime: ~150 ms partial results, $0.39 per hour, 2.5 h free. In the browser, use `@elevenlabs/react` `useScribe` (or `Scribe.connect` from `@elevenlabs/client`) with a single-use token from a Next.js route (`POST /v1/single-use-token/realtime_scribe`, valid 15 minutes). The key stays on the server. Useful options:
- `commit_strategy` of `manual` (fits push-to-talk), `vad` or `turn_prediction`.
- `keyterms`: up to 50 words to bias recognition towards script vocabulary.
- `entity_detection` (added Aug 2026): emits `committed_transcript_entities` for `pci` (card, expiry, CVV), `password` (covers PINs and verification answers), `bank_account` and `routing_number`. This is a free second signal for the Gatekeeper; pricing isn't stated.

Zero-retention mode is Enterprise-only, so ElevenLabs logs the audio.

**ElevenLabs Agents with a custom LLM.** Yes, this works. An agent can use any Chat Completions or Responses-compatible URL, with the API key stored as a workspace secret. The endpoint must stream SSE. It could point straight at `https://api.mubit.ai/openai/v1`. Pointing it at our own Next.js route is better, because that route can run the Gatekeeper before forwarding to Mubit and can strip `elevenlabs_extra_body` and `user_id`, which OpenAI may reject. Mubit's own team built this relay pattern in `Mubit-x-Voice-Agents-Demo`. Agents cost $0.08 a minute, and only 15 minutes are free.

**Verdict: hand-built branching player.** Agents put an LLM on every turn. That makes each reply slower and less predictable, drops the pre-generated audio, puts raw user speech on ElevenLabs before our masking runs, and charges per minute while judges play. A push-to-talk player is a few hours of work: play the clip, hold to talk, Scribe commits, the matcher picks a branch, and the LLM handles only misses. It is predictable for the demo and cheap.

## 3. Browser speech-to-text (Oct 2026)

From MDN compatibility data (22 Oct 2026) and caniuse:

| Browser | Support | Where audio goes |
|---|---|---|
| Chrome desktop | Yes (unprefixed since 139) | Google servers by default; `processLocally = true` runs on-device after a one-time language-pack `install()` |
| Chrome Android | Yes; `continuous` has no effect | Google servers; no on-device option |
| Safari macOS 14.1+ / iOS 14.5+ | Partial, `webkit` prefix | Apple |
| Edge | Listed from 139; local models for 6 languages from Edge 150 | Microsoft |
| Firefox | Preview (Nightly) only | n/a |
| Brave | API exists but fails; Google won't serve Brave | n/a |

The microphone (`getUserMedia`) needs a secure context: HTTPS or `localhost`. Testing on a phone via a LAN IP over plain HTTP will fail. On iOS, start audio playback and the microphone from the same tap ("Answer call").

Recommendation: use Scribe Realtime everywhere, so every judge's phone behaves the same, including Firefox and Brave. Skip the Web Speech API. Always offer a type-your-reply box for denied mic permission, noisy rooms and accessibility.

## 4. Deploy

Confirmed: a SQLite file on Vercel does not persist. Vercel's guide says SQLite "can't be used with Vercel" because "storage is ephemeral with serverless functions".

**Recommendation: Vercel Hobby plus Turso.** Turso is hosted libSQL, a SQLite fork, so the schema and SQL from the design stay the same. Use `@libsql/client` with `file:local.db` in development and the Turso URL in production. The free tier needs no card and gives 100 databases, 5 GB, and 500M row reads and 10M row writes a month. Vercel's Hobby functions run for up to 300 s, which is plenty for LLM calls. Set the function region near the database.

Alternatives: Neon Postgres through the Vercel Marketplace (means a schema change), Railway or Fly with a volume (a real SQLite file, more setup), or a `cloudflared` quick tunnel from the laptop as an emergency fallback only (the laptop must stay on, and the URL changes).

Vercel's Standard Protection puts preview and deployment URLs behind a Vercel login. Share only the production domain and check it in a private window.

## 5. Sensitive-data detection

Run one shared function in the browser on every committed transcript before any `fetch`. Run it again on the server.

1. **Normalise.** Lowercase the text. Map `zero/oh/o/nought/nil` to 0 and `one`…`nine` to digits. Expand `double 7` to 77 and `triple 4` to 444. Join digits separated by spaces, hyphens or dots into runs, so "four two seven, double one" becomes `42711`. Both STT engines often output digits already, so this mostly catches leftovers.
2. **Check each digit run:**
   - Card: 13–19 digits that pass the Luhn check.
   - UK sort code: 6 digits (`\d{2}[- ]?\d{2}[- ]?\d{2}`).
   - UK account: 8 digits.
   - US routing: 9 digits where 3·(d1+d4+d7) + 7·(d2+d5+d8) + (d3+d6+d9) is divisible by 10.
   - US account: 4–17 digits near "account".
   - OTP or PIN: 4–8 digits within about 6 words of `code|otp|pin|passcode|verification|security|digits`.
   - CVV: 3–4 digits near `cvv|security code|back of (the) card`.
   - Expiry: `(0[1-9]|1[0-2]) ?/ ?\d{2}` near "expir".
   - Any run of 8 or more digits counts as a hit anyway, which also catches phone numbers.
3. **Check words.** `(password|passcode|memorable word|pin)( is|'s| it's)` masks the rest of the utterance. Four or more single letters in a row ("p a s s") means spelling, so mask them too. Optional extras: UK National Insurance number (`[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]`) and US SSN (`\d{3}-?\d{2}-?\d{4}`).
4. **Mask, then send.** Replace each hit with a tag (`[CARD]`, `[CODE]`, `[PASSWORD]`) and send only the masked string. On a hit, stop the call and log only "stopped at step N". Add Scribe's `entity_detection` events as a second signal. Treat a made-up code the same as a real one: sharing any code fails the drill.

This masking cannot protect the raw audio. The STT provider has already heard it. Tell users up front never to say real details, even in practice.

## Risks for the build

1. Adapters can't run live, so the "Mubit takes over" story rests on console screenshots and our own counters. Say so plainly in the demo.
2. The first training may come late or fail with no retry. Push the Teacher task past 25 kept examples tonight, leaving time for a second attempt after the 01:00 reset.
3. There are 3 adapter starts per UTC day, and a cold start takes minutes. Save Sunday's starts for judging and warm the adapter just before.
4. Starter credit caps calls in flight (`429`) when several judges play at once. Add our own provider keys and rate-limit per session.
5. iOS needs audio and mic started from a tap, and the silent switch can mute playback. Test on a real iPhone early.
6. On speakerphone, the mic hears the scammer clip. Push-to-talk avoids that.
7. The free ElevenLabs quotas are small (10K v4 characters, 2.5 h Scribe). Buy Starter.
8. Preview URLs require a Vercel login. Share the production URL only.
9. Keep API keys server-side only. The browser gets single-use Scribe tokens.

## Sources

- Mubit docs, full text: https://docs.mubit.ai/llms-full.txt (Model IDs, Requests, Tasks and sessions, First adapter, API reference, Troubleshooting, Mubit keys)
- https://docs.mubit.ai/guides/model-ids · https://docs.mubit.ai/guides/first-adapter · https://docs.mubit.ai/guides/requests · https://docs.mubit.ai/guides/tasks-and-sessions · https://docs.mubit.ai/reference/api
- Banyan Sapling: https://huggingface.co/MubitLabs/banyan-sapling · demo Space https://huggingface.co/spaces/MubitLabs/banyan-sapling-demo
- MubitLabs GitHub: https://github.com/MubitLabs · https://github.com/MubitLabs/demo · https://github.com/MubitLabs/Mubit-x-Voice-Agents-Demo · https://www.npmjs.com/package/@mubit-ai/sdk
- ElevenLabs models: https://elevenlabs.io/docs/overview/models · pricing https://elevenlabs.io/pricing/api
- ElevenLabs speed: https://elevenlabs.io/docs/product-guides/playground/text-to-speech
- Scribe realtime: https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/client-side-streaming · https://elevenlabs.io/docs/api-reference/speech-to-text · entity detection https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/batch/entity-detection · zero retention https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode
- Agents custom LLM: https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm
- Web Speech: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API · https://caniuse.com/speech-recognition · MDN browser-compat-data 8.1.7 · Brave on Google's speech service https://community.brave.com/t/years-of-brave-failing-google-voice-search-with-no-internet-connection-error/395749/2
- getUserMedia secure context: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Vercel: https://vercel.com/kb/guide/is-sqlite-supported-in-vercel · https://vercel.com/docs/functions/limitations · https://vercel.com/docs/deployment-protection
- Turso pricing: https://turso.tech/pricing
