export const CATEGORIES = [
  "bank_impersonation",
  "delivery_fee",
  "tax_refund",
  "family_emergency",
  "tech_support",
  "investment_crypto",
  "romance",
  "job_task",
  "marketplace_purchase",
  "account_takeover_code",
] as const;

export const TECHNIQUES = [
  "urgency",
  "authority",
  "fear",
  "secrecy",
  "too_good",
  "payment_method",
  "channel_switch",
  "spoofing",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Technique = (typeof TECHNIQUES)[number];

export const LABELS: Record<Category | Technique, string> = {
  bank_impersonation: "Fake bank calls",
  delivery_fee: "Parcel fee texts",
  tax_refund: "Tax refund messages",
  family_emergency: "'Hi Mum' family emergencies",
  tech_support: "Fake tech support",
  investment_crypto: "Investment and crypto",
  romance: "Romance scams",
  job_task: "Job and task scams",
  marketplace_purchase: "Online marketplace scams",
  account_takeover_code: "Requests for your one-time code",
  urgency: "Rushing you",
  authority: "Pretending to be official",
  fear: "Scaring you",
  secrecy: "Telling you to keep it secret",
  too_good: "Too good to be true",
  payment_method: "Odd ways to pay",
  channel_switch: "Moving you to another app or number",
  spoofing: "Faked caller ID or sender",
};
