// Generated content must use fictional brands. This list fails closed on the
// names scammers impersonate most in the UK and US.
export const REAL_BRANDS = [
  "Barclays", "HSBC", "Lloyds", "NatWest", "Santander", "Halifax", "Nationwide", "Monzo", "Starling", "Revolut",
  "TSB", "Metro Bank", "Virgin Money", "First Direct", "Co-operative Bank", "Chase", "Bank of America", "Wells Fargo",
  "Citibank", "Capital One", "American Express", "Amex", "Visa", "Mastercard", "PayPal", "Venmo", "Zelle", "Cash App",
  "Royal Mail", "Parcelforce", "Evri", "Hermes", "DPD", "DHL", "UPS", "FedEx", "USPS", "Yodel",
  "HMRC", "IRS", "DVLA", "NHS", "Ofgem", "TV Licensing", "Social Security", "Medicare",
  "Amazon", "eBay", "Facebook", "Meta", "Instagram", "WhatsApp", "Google", "Apple", "Microsoft", "Netflix",
  "Coinbase", "Binance", "Vinted", "Gumtree", "Depop", "Etsy", "BT", "Vodafone", "EE", "O2", "Sky", "Virgin Media",
];

const PATTERN = new RegExp(
  `\\b(${REAL_BRANDS.map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "g", // case-sensitive: "apple", "chase", "sky" as plain words are fine
);

export function checkBrands(text: string): { ok: boolean; found: string[] } {
  const found = [...new Set((text.match(PATTERN) ?? []).map((m) => m.toLowerCase()))];
  return { ok: found.length === 0, found };
}
