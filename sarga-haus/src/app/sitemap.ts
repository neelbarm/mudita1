import type { MetadataRoute } from "next";

const BASE = "https://sargahaus.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, priority: 1 },
    { url: `${BASE}/services`, priority: 0.9 },
    { url: `${BASE}/how-it-works`, priority: 0.8 },
    { url: `${BASE}/builds`, priority: 0.8 },
    { url: `${BASE}/about`, priority: 0.7 },
    { url: `${BASE}/start`, priority: 0.9 },
    { url: `${BASE}/journal`, priority: 0.5 },
    { url: `${BASE}/journal/the-dm-is-a-queue-with-no-exit`, priority: 0.4 },
  ];
}
