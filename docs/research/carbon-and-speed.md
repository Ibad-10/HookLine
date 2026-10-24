# Carbon and speed comparison: research notes

Status: partial. The research was cut short by a time limit. Gaps are marked **UNVERIFIED** and need checking before anyone quotes them.

## What we can honestly claim

No hosted API reports energy per call, so nothing on the carbon panel is measured. It is an estimate: tokens we counted, multiplied by published energy-per-token figures, multiplied by an assumed grid carbon intensity. The speed panel is different. We measure it ourselves.

## Method

```
effective_tokens = output_tokens + INPUT_WEIGHT * input_tokens
energy_Wh        = effective_tokens / 1000 * WH_PER_1K_OUT[band]
carbon_g         = energy_Wh * GRID_G_PER_KWH / 1000
```

- `WH_PER_1K_OUT` already includes datacentre overhead (PUE, host CPU, idle capacity), because it comes from full-system figures (Jegham et al., Google). Do not multiply by PUE again.
- Run the formula three times, once each with the low, central and high constants. Show central as the headline and low–high as a bar.
- Use the same grid intensity for all three setups by default. That way the comparison shows differences between models, not between regions.

### Worked example (central constants)

Lesson JSON with 800 output tokens.

| Setup | Input tok | Effective tok | Wh | g CO2e @ 300 g/kWh |
|---|---|---|---|---|
| Frontier, short prompt | 300 | 830 | 1.66 | 0.50 |
| Frontier, long prompt | 3,000 | 1,100 | 2.20 | 0.66 |
| Adapter (~3–8B) | 300 | 830 | 0.17 | 0.05 |

Range for the adapter row: 0.02 Wh × 0.83 × 125 g/kWh ≈ 0.002 g at the low end, and 1.0 × 0.83 × 450 ≈ 0.37 g at the high end. The range is wide, and we should show all of it.

## Recommended constants

```ts
// Wh per 1,000 output tokens, full-system incl. datacentre overhead
WH_PER_1K_OUT = {
  frontier: { low: 0.5,  central: 2.0, high: 5.0 },
  small:    { low: 0.02, central: 0.2, high: 1.0 }, // ~3-8B adapter
};
INPUT_WEIGHT   = { low: 0.05, central: 0.1, high: 0.2 }; // input token vs output token
GRID_G_PER_KWH = { low: 125, central: 300, high: 450 };
```

How each constant was derived:

- **Frontier low 0.5.** Epoch puts a GPT-4o query at about 0.3 Wh, and Google puts the median Gemini prompt at 0.24 Wh. Neither publishes token counts, so this low end assumes a few hundred output tokens.
- **Frontier central 2.0.** Jegham et al. measure GPT-4o at 1.2–1.4 Wh per 1k output tokens and Claude 3.7 Sonnet at about 3.0–3.2. Central sits between the two.
- **Frontier high 5.0.** Claude 3.7 Sonnet plus its spread, and Llama-3.1-70B at about 4.2 (Jegham). This covers larger or reasoning-heavy models.
- **Small central 0.2.** Jegham measures Llama-3.1-8B at 0.17 Wh/1k and Llama-3.2-3B at 0.48, both at batch 8 on H100 with overhead included.
- **Small low 0.02.** This is our extrapolation, not a measured figure. ML.ENERGY measured Qwen3-32B at 0.15–0.21 J/token (0.04–0.06 Wh/1k) at large batch on B200, and a model under 8B should use less.
- **Small high 1.0.** This is our estimate for a dedicated GPU serving one request at a time (a likely hackathon setup). A whole GPU drawing about 300–400 W while generating about 100 tok/s works out to roughly 3 J/token, or about 0.8 Wh/1k. The power draw and speed figures are assumptions, not sourced.
- **INPUT_WEIGHT.** Taken from Jegham's medium vs long prompt results. Adding 9k input tokens cost about 0.12–0.13 Wh per 1k input tokens, which is about 1/10 to 1/20 of the cost of an output token. Epoch's long-input figure (10k input ≈ 2.5 Wh) is consistent. Input is processed in parallel, which is why it costs less per token.
- **GRID low 125.** Google's 0.03 g ÷ 0.24 Wh, Google's own fleet average. The blog does not say whether this is market-based or location-based accounting, and its low value suggests the effect of clean-energy purchasing.
- **GRID central 300.** Jegham uses 287 g/kWh for AWS and 350 for Azure.
- **GRID high 450.** Judgement call for fossil-heavy grids. **UNVERIFIED.** For comparison, Jegham uses 600 for DeepSeek in China.
- 1 Wh per 1k tokens = 3.6 J/token.

## Published figures

| Source | Figure | Notes |
|---|---|---|
| Google, Aug 2025 (Gemini Apps) | Median text prompt: 0.24 Wh, 0.03 gCO2e, 0.26 mL water | Includes idle machines, host CPU/RAM and PUE 1.09. Accelerator-only figure: 0.10 Wh. No token counts. Not independently verified. 33× less energy than May 2024. |
| Epoch AI, Feb 2025 | GPT-4o query ≈ 0.3 Wh | Assumes 1 H100-second at 1,500 W and 70% utilisation. Inputs of 10k tokens ≈ 2.5 Wh, 100k ≈ 40 Wh. |
| Mistral Large 2 LCA, Jul 2025 | 400-token response = 1.14 gCO2e (≈ 2.85 g per 1k tokens) | Life-cycle figure that includes upstream hardware manufacturing. Training plus 18 months of use = 20.4 ktCO2e. Peer-reviewed and follows the AFNOR Frugal AI method. |
| Jegham et al. 2025 (arXiv 2505.09598 v6) | Short query (100 in / 300 out): Claude 3.7 Sonnet 0.95 Wh, GPT-4o 0.42, GPT-4.1 0.87, GPT-4.1 nano 0.21, Llama-3.1-8B 0.05, Llama-3.2-3B 0.14, Llama-3.1-70B 1.27 | Modelled, not metered: API latency × assumed DGX power. PUE 1.12 (Azure) / 1.14 (AWS). Headline numbers changed between versions, so cite v6. |
| ML.ENERGY (Chung et al., arXiv 2601.22076) | Qwen3-32B on B200: 0.15–0.21 J/token at batch 128–512 | Metered GPU energy. Larger batches cut energy per token by 3–5×. B200 uses about 35% less than H100. Generation, not input processing, dominates. |
| AI Energy Score v2, Dec 2025 | SmolLM3-3B 18 Wh per 1k queries. Turning reasoning on raises it 150–700× | GPU-only. Token counts per query not captured. |
| Luccioni et al., "Power Hungry Processing" | Text generation: 0.047 kWh per 1k inferences | A100, only 10 output tokens each. Too old and too short to use for constants. |

## Grid carbon intensity

- **UK Carbon Intensity API** (National Grid ESO; free, no key). **UNVERIFIED, from memory, confirm before coding:** `GET https://api.carbonintensity.org.uk/intensity` returns `data[0].intensity.{forecast, actual, index}` in gCO2/kWh. There are also `/regional`, `/regional/postcode/{outcode}` and `/generation`. Use it only if a model actually runs in the UK, or label it "if this ran on today's UK grid".
- **Electricity Maps:** zone-level live intensity. **UNVERIFIED**, but believed to need an API key, with a free tier for non-commercial use.
- **Provider figures:** providers usually report *market-based* emissions, which count renewable purchases and come out low. *Location-based* emissions (the physical grid mix) are higher. Say on screen which one a number uses. Google's 0.03 g is a fleet average, and its accounting basis isn't stated.

## Speed sanity ranges (UNVERIFIED, no sources gathered)

Check these against Artificial Analysis (artificialanalysis.ai) before relying on them.

- Frontier API (Sonnet / GPT-class): time to first token roughly 0.5–2 s, output roughly 40–100 tok/s.
- 3–8B on a fast host (Groq, Cerebras, Together): time to first token roughly 0.1–0.5 s, output 200–1,000+ tok/s.
- 3–8B self-hosted on a single GPU, one request at a time: roughly 50–150 tok/s on A100/H100, much lower on a T4/L4 or a CPU.
- Cold starts on serverless GPUs (Modal, HF endpoints) can add 10–60 s. Report them separately and leave them out of the median.

## Pitfalls

1. **Implying measurement.** Never write "uses X g". Write "estimated ~X g (range A–B)".
2. **False precision.** Round to 2 significant figures. The constants are uncertain to within about 3×.
3. **Ignoring training.** The adapter's fine-tune cost is real but one-off. Note that it is excluded, or show it separately as a one-off number. The frontier model's training is amortised over billions of calls, and nobody can attribute a share to us.
4. **Ignoring embodied carbon.** Our figures cover operation only. Mistral's life-cycle number (≈ 2.85 g per 1k tokens) is several times our operational central figure for a frontier model (≈ 0.6 g per 1k), and part of that gap is hardware manufacturing.
5. **Mixing grids.** Comparing a model on a clean grid with one on a dirty grid measures geography, not models. Use one shared intensity by default.
6. **Reasoning modes.** Hidden reasoning tokens can multiply energy by 30–700×. Count them in output tokens if the API reports them.
7. **Batching assumptions.** Big providers batch requests heavily and our adapter host may not. That is why the adapter's high constant is 50× its low one.
8. **Old figures.** Per-prompt energy fell 33× in a year (Google). Show the date the constants were set.

## On-screen wording

> **Estimated carbon per call: ~0.5 g CO₂e** (range 0.1–2.3 g)
> We can't measure the energy a hosted AI model uses, so this is an estimate. We count the tokens each call uses and multiply by published energy-per-token figures (Google 2025, Epoch AI 2025, Jegham et al. 2025, ML.ENERGY) and an assumed grid intensity of 300 g CO₂e/kWh. It covers running the model only, not training it or building the hardware. Figures as of Oct 2026. [How we calculate this]

> **Speed:** measured on this device, median of N calls. Time to first token / tokens per second.

## Sources

- Google Cloud blog, "Measuring the environmental impact of AI inference" (21 Aug 2025): https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference
- Google paper: https://arxiv.org/abs/2508.15734
- Epoch AI, "How much energy does ChatGPT use?": https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use
- Mistral LCA coverage (original report not fetched): https://simonwillison.net/2025/Jul/22/mistral-environmental-standard/ and https://the-decoder.com/mistral-ai-publishes-the-first-comprehensive-life-cycle-assessment-of-a-large-language-model/
- Jegham et al., "How Hungry is AI?": https://arxiv.org/abs/2505.09598 (v6 HTML: https://arxiv.org/html/2505.09598v6)
- Chung et al., "Where Do the Joules Go?" (ML.ENERGY, 2026): https://arxiv.org/abs/2601.22076
- ML.ENERGY leaderboard: https://ml.energy/leaderboard
- AI Energy Score v2: https://huggingface.co/blog/sasha/ai-energy-score-v2
- Luccioni et al., "Power Hungry Processing": https://arxiv.org/abs/2311.16863
- Vartziotis et al. 2026, "From Tokens to Watt-hours" (analytical estimator, not read in full): https://arxiv.org/abs/2607.26571
- UK Carbon Intensity API: https://api.carbonintensity.org.uk/ (endpoints UNVERIFIED)
- Artificial Analysis (speed): https://artificialanalysis.ai/ (not checked)
