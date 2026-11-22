import type { MetadataRoute } from "next";
import { getAdventures } from "@/lib/data";

export const revalidate = 3600;

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bromountain.in"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const adventures = await getAdventures();

  // static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/adventures`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/reviews`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // dynamic adventure pages — read from Supabase, not dummy data
  const adventurePages: MetadataRoute.Sitemap = adventures
    .filter((adventure) => adventure.is_active)
    .map((adventure) => ({
      url: `${SITE_URL}/adventures/${adventure.slug}`,
      lastModified: adventure.updated_at
        ? new Date(adventure.updated_at)
        : now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  return [...staticPages, ...adventurePages];
}
