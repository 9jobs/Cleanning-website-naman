export const site = {
  name: "Thrive4 Cleaning",
  tagline:
    "Professional Cleaning for Homes, Properties, Workplaces and Construction Sites",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4317",
  phone: "+61 422 552 002",
  email: "Thrive4cleaning@gmail.com",
  address: "57 Coorie Cres, Rosanna VIC 3084, Australia",
  abn: "",
  hours: "Monday to Saturday, 7:00am – 6:00pm AEST (Subject to confirmation)",
  coverage: [] as { suburb: string; postcode: string; state: string }[],
  socials: [] as { label: string; url: string }[],
};
export const nav = [
  ["Home", "/"],
  ["Who We Are", "/about"],
  ["Services", "/services"],
  ["Pricing", "/pricing"],
  ["Contact", "/contact"],
];
export const extras = ["Fridge cleaning", "Additional cleaning time"];
export const frequencies = ["Weekly", "Fortnightly", "Monthly", "One-off"];
export const testimonials: {
  name: string;
  service: "Residential" | "Commercial" | "Specialist";
  quote: string;
  rating: number;
  verified: boolean;
}[] = [];
// Publish only rates approved by the business. All amounts are AUD including GST.
export const rates = {
  approved: false,
  base: {
    Residential: 0,
    "Property Cleaning": 0,
    "End of Lease": 0,
    Commercial: 0,
  },
  bedroom: 0,
  bathroom: 0,
  perSquareMetre: 0,
  extra: 0,
  discount: { Weekly: 0, Fortnightly: 0, Monthly: 0, "One-off": 0 },
};
export function estimate(
  category: keyof typeof rates.base,
  bedrooms: number,
  bathrooms: number,
  frequency: keyof typeof rates.discount,
  extraCount: number,
  size = 0,
) {
  if (!rates.approved) return null;
  return Math.round(
    (rates.base[category] +
      Math.max(0, bedrooms - 1) * rates.bedroom +
      Math.max(0, bathrooms - 1) * rates.bathroom +
      extraCount * rates.extra +
      (category === "Commercial" ? size * rates.perSquareMetre : 0)) *
      (1 - rates.discount[frequency]),
  );
}
