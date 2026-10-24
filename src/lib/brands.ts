// Generated content must use fictional brands. This list fails closed on the
// names scammers impersonate most in the UK and US.
export const REAL_BRANDS = [
  "Barclays", "HSBC", "Lloyds", "NatWest", "Santander", "Halifax", "Nationwide", "Monzo", "Starling", "Revolut",
  "TSB", "Metro Bank", "Virgin Money", "First Direct", "Co-operative Bank", "Chase", "Bank of America", "Wells Fargo",
  "Citibank", "Capital One", "American Express", "Amex", "Visa", "Mastercard", "PayPal", "Venmo", "Zelle", "Cash App",
  "Royal Mail", "Parcelforce", "Evri", "Hermes", "DPD", "DHL", "UPS", "FedEx", "USPS", "Yodel",
  "HMRC", "IRS", "DVLA", "NHS", "Ofgem", "TV Licensing", "Social Security", "Medicare",
  "FTC", "FBI", "IC3", "Action Fraud", "Met Police", "Scotland Yard", "FCA", "Ofcom", "NCSC", "Citizens Advice", "Age UK", "AARP",
  "Amazon", "eBay", "Facebook", "Meta", "Instagram", "WhatsApp", "Google", "Apple", "Microsoft", "Netflix",
  "Coinbase", "Binance", "Vinted", "Gumtree", "Depop", "Etsy", "BT", "Vodafone", "EE", "O2", "Sky", "Virgin Media",
];

const PATTERN = new RegExp(
  `\\b(${REAL_BRANDS.map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "g", // case-sensitive: "apple", "chase", "sky" as plain words are fine
);

export function checkBrands(text: string): { ok: boolean; found: string[] } {
  const hits = [...(text.match(PATTERN) ?? []), ...(text.match(CAPS) ?? []), ...[...text.matchAll(DOMAIN)].map((m) => m[1])];
  const found = [...new Set(hits.map((m) => m.toLowerCase()))];
  return { ok: found.length === 0, found };
}

// Rewrite: swap each real name for a made-up one of the same kind, so a lesson
// about "people pretending to be the FTC" still works without naming the FTC.
const KIND: [RegExp, string][] = [
  [/^(barclays|hsbc|lloyds|natwest|santander|halifax|nationwide|monzo|starling|revolut|tsb|metro ?bank|virgin ?money|first ?direct|co-operative ?bank|chase|bank ?of ?america|wells ?fargo|citibank|capital ?one)$/i, "Northgate Bank"],
  [/^(american ?express|amex|visa|mastercard|paypal|venmo|zelle|cash ?app|coinbase|binance)$/i, "PayWell"],
  [/^(royal ?mail|parcelforce|evri|hermes|dpd|dhl|ups|fedex|usps|yodel)$/i, "SwiftParcel"],
  [/^(amazon|ebay|vinted|gumtree|depop|etsy)$/i, "ShopLane"],
  [/^(bt|vodafone|ee|o2|sky|virgin ?media|netflix)$/i, "BrightLine Mobile"],
  [/^(facebook|meta|instagram|whatsapp|google|apple|microsoft)$/i, "a big tech company"],
];
const kindOf = (name: string) => KIND.find(([re]) => re.test(name))?.[1] ?? "a government agency";

// Brand names also hide in web addresses ("royalmail.com/redeliver", "paypal-secure.com")
// and in capitals ("PAYPAL"). Slugs under 3 letters (ee, o2, bt) are skipped in addresses.
const slug = (b: string) => b.toLowerCase().replace(/[^a-z0-9]/g, "");
const SLUGS = [...new Set(REAL_BRANDS.map(slug).filter((s) => s.length >= 3))];
const escape = (b: string) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const DOMAIN = new RegExp(`\\b[\\w.-]*(${SLUGS.join("|")})[\\w-]*\\.[a-z]{2,}[\\w./-]*`, "gi");
const CAPS = new RegExp(`\\b(${REAL_BRANDS.filter((b) => b !== b.toUpperCase()).map((b) => escape(b.toUpperCase())).join("|")})\\b`, "g");

export function scrubBrands(text: string): string {
  return text
    .replace(DOMAIN, (_, s: string) => `${kindOf(s).toLowerCase().replace(/^an? /, "").replace(/[^a-z]+/g, "-")}.example`)
    .replace(PATTERN, kindOf)
    .replace(CAPS, kindOf)
    .replace(/Northgate Bank Bank/g, "Northgate Bank");
}
