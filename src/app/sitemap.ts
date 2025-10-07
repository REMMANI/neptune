import { listAllPageSlugs } from "@/lib/cms";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["en","fr","es","ar"] as const;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const entries = await Promise.all(locales.map(async (locale) => {
    const slugs: string[][] = await listAllPageSlugs(locale);
    return slugs.map((segments: string[]) => ({
      url: `${base}/${locale}/${segments.join("/")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }));

  return entries.flat();
}
