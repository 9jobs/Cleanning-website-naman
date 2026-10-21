import { articles } from "./data";

// These editorial photos belong to the home preview, separate from service tiles.
const photos: Record<string, { image: string; imageAlt: string }> = {
  "a-calm-weekly-cleaning-routine": {
    image: "/images/guide-home-detail.webp",
    imageAlt: "Gloved hand wiping a kitchen benchtop beside cleaning supplies",
  },
  "moving-out-cleaning-checklist": {
    image: "/images/guide-rental-handover.webp",
    imageAlt:
      "Keys on a window ledge overlooking an empty, clean rental apartment",
  },
  "garden-outdoor-cleaning-checklist": {
    image: "/images/guide-garden-detail.webp",
    imageAlt: "Male cleaner gathering dry leaves from a paved garden path",
  },
  "post-construction-cleaning-scope": {
    image: "/images/guide-build-dust.webp",
    imageAlt: "Vacuum brush removing settled building dust from a window sill",
  },
  "prepare-property-after-renovation": {
    image: "/images/guide-renovation-finish.webp",
    imageAlt: "Male cleaner caring for cabinet fronts in a renovated kitchen",
  },
  "commercial-workplace-cleaning-checklist": {
    image: "/images/guide-workplace-detail.webp",
    imageAlt: "Male cleaner wiping a glass table in a workplace meeting room",
  },
};

export const homeGuideCards = articles.slice(0, 6).map((article) => ({
  ...article,
  ...photos[article.slug],
}));
