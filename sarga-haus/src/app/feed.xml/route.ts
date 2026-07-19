import { allEssays } from "@/lib/essays";
import { absoluteUrl, SITE } from "@/lib/site";

export const dynamic = "force-static";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** RSS 2.0 feed for the journal. */
export function GET(): Response {
  const essays = allEssays();
  const newest = essays[0]?.date ?? "2026-07-18";

  const items = essays
    .map((e) => {
      const url = absoluteUrl(`/journal/${e.slug}`);
      return [
        "    <item>",
        `      <title>${esc(e.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(`${e.date}T12:00:00Z`).toUTCString()}</pubDate>`,
        `      <description>${esc(e.excerpt)}</description>`,
        ...e.tags.map((t) => `      <category>${esc(t)}</category>`),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${esc(SITE.name)} Journal</title>`,
    `    <link>${absoluteUrl("/journal")}</link>`,
    `    <description>${esc("Notes from the studio on building products, automating operations, and constructing pipelines.")}</description>`,
    "    <language>en-us</language>",
    `    <lastBuildDate>${new Date(`${newest}T12:00:00Z`).toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
