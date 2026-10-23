import type { MetadataRoute } from "next";
import { publicServices as services, articles } from "@/lib/data";
import { site } from "@/lib/config";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "about",
    "services",
    "pricing",
    "areas",
    "reviews",
    "faq",
    "contact",
    "book",
    "careers",
    "blog",
    ...services.map((s) => `services/${s.slug}`),
    ...articles.map((a) => `blog/${a.slug}`),
  ].map((path) => ({
    url: `${site.url}/${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.7 : 1,
  }));
}
