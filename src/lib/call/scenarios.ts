import crypto from "../../data/scenarios/crypto-offer.json";
import family from "../../data/scenarios/family-emergency.json";
import parcelFee from "../../data/scenarios/parcel-fee.json";
import safeAccount from "../../data/scenarios/safe-account.json";
import techSupport from "../../data/scenarios/tech-support.json";
import type { Scenario } from "./types";

export const SCENARIOS: Record<string, Scenario> = {
  "safe-account": safeAccount as Scenario,
  "parcel-fee": parcelFee as Scenario,
  "tech-support": techSupport as Scenario,
  "family-emergency": family as Scenario,
  "crypto-offer": crypto as Scenario,
};

