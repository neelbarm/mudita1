import type { MetadataRoute } from "next";
import { allEssays } from "@/lib/essays";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const essays = allEssays();
  const newestEssay = essays[0]?.date;

  return [
    { url: SITE.url, priority: 1 },
    { url: `${SITE.url}/services`, priority: 0.9 },
    { url: `${SITE.url}/start`, priority: 0.9 },
    { url: `${SITE.url}/how-it-works`, priority: 0.8 },
    { url: `${SITE.url}/builds`, priority: 0.8 },
    { url: `${SITE.url}/about`, priority: 0.7 },
    {
      url: `${SITE.url}/journal`,
      priority: 0.7,
      lastModified: newestEssay ? new Date(`${newestEssay}T12:00:00Z`) : undefined,
    },
    ...essays.map((e) => ({
      url: `${SITE.url}/journal/${e.slug}`,
      priority: 0.6,
      lastModified: new Date(`${e.date}T12:00:00Z`),
    })),
  ];
}
