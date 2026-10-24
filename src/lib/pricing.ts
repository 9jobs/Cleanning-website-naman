export const PRICING_HOURLY_RATE = 79;
export function pricingHourlyRate(service: string) {
  if (service === "one-off-cleaning") return 89;
  if (service === "property-cleaning") return 99;
  return PRICING_HOURLY_RATE;
}
export const PRICING_MAX_HOURS = 24;
export const pricingServices = [
  "house-cleaning",
  "one-off-cleaning",
  "property-cleaning",
  "commercial-cleaning",
  "office-cleaning",
  "construction-cleaning",
  "airbnb-cleaning",
] as const;
