import type { MetadataRoute } from "next";

const siteUrl = "https://www.buildwithjazz.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/chat`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
