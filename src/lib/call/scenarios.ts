import parcelFee from "../../data/scenarios/parcel-fee.json";
import safeAccount from "../../data/scenarios/safe-account.json";
import type { Scenario } from "./types";

export const SCENARIOS: Record<string, Scenario> = {
  "safe-account": safeAccount as Scenario,
  "parcel-fee": parcelFee as Scenario,
};
