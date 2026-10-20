import type { MetadataRoute } from "next";
import { site } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/book/confirmation", "/quote/confirmation"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
