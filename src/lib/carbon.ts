// Estimate only: hosted model energy can't be measured. Constants and sources in
// docs/research/carbon-and-speed.md (set Oct 2026).
const WH_PER_1K_OUT = {
  frontier: { low: 0.5, central: 2.0, high: 5.0 },
  small: { low: 0.02, central: 0.2, high: 1.0 },
};
const INPUT_WEIGHT = { low: 0.05, central: 0.1, high: 0.2 };
export const GRID_G_PER_KWH = 300;

export type Range = { low: number; central: number; high: number };

export function estimateCarbon(o: { inTok: number; outTok: number; size: "frontier" | "small" }): Range {
  const at = (k: keyof Range) =>
    ((o.outTok + o.inTok * INPUT_WEIGHT[k]) / 1000) * WH_PER_1K_OUT[o.size][k] * (GRID_G_PER_KWH / 1000);
  return { low: at("low"), central: at("central"), high: at("high") };
}
