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
};

export const homeGuideCards = articles.slice(0, 6).map((article) => ({
  ...article,
  ...photos[article.slug],
}));
