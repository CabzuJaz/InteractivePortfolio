import type { MetadataRoute } from "next";

const siteUrl = "https://www.buildwithjazz.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Client-facing and intake surfaces carry per-client state; keep them out of search.
      disallow: ["/api/", "/dashboard", "/client/", "/prep"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
