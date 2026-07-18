import type { Json } from "../../../os/store/types.js";
import type { RawRecord, SourceConnector } from "../types.js";
import { scrapeMarkdown } from "./client.js";

/**
 * Directory crawl: scrape a public listing page (an association
 * member list, a "best studios in Austin" roundup, a niche directory)
 * and extract company names with their outbound links from the
 * markdown. Deliberately conservative: obvious markdown links only,
 * junk filtered, everything still lands behind the human gate.
 */

const SKIP_HOSTS = /(google|facebook|instagram|twitter|x\.com|linkedin|yelp|youtube|maps\.|wikipedia|reddit)/i;

export class DirectoryConnector implements SourceConnector {
  readonly kind = "directory_crawl" as const;
  readonly provider = "hyperbrowser";

  async *discover(query: Json): AsyncGenerator<RawRecord> {
    const url = String(query.url);
    const geo = query.geo ? String(query.geo) : null;
    const md = await scrapeMarkdown(url);
    const seen = new Set<string>();
    for (const m of md.matchAll(/\[([^\]]{3,80})\]\((https?:\/\/[^)\s]+)\)/g)) {
      const name = (m[1] ?? "").trim();
      const href = m[2] ?? "";
      let host: string;
      try {
        host = new URL(href).hostname;
      } catch {
        continue;
      }
      if (SKIP_HOSTS.test(host)) continue;
      if (/^(read more|learn more|website|visit|click here|home|next|previous|\d+)$/i.test(name)) continue;
      if (seen.has(host)) continue;
      seen.add(host);
      yield {
        kind: "company",
        name,
        domain: host,
        url: href,
        geo,
        extra: { directory: url },
      };
    }
  }
}
