import type { MetadataRoute } from "next";
import { tipArticles } from "@/lib/tips";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: appUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl}/tips`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${appUrl}/terms`, lastModified: new Date("2026-08-05"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${appUrl}/privacy`, lastModified: new Date("2026-08-05"), changeFrequency: "yearly", priority: 0.3 },
    ...tipArticles.map((article) => ({
      url: `${appUrl}/tips/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
