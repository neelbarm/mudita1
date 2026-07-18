import type { Json } from "../../../os/store/types.js";
import type { RawRecord, SourceConnector } from "../types.js";
import { scrapeMarkdown } from "./client.js";

/**
 * Google Maps sourcing. IMPORTANT: scraping Maps sits in tension with
 * the studio's own published compliance posture (docs/07: no scraping
 * that violates platform terms). This connector therefore:
 *   - only runs with the explicit --i-understand-tos CLI flag,
 *   - is never wired into any n8n schedule,
 *   - lands candidates behind the human sourcing gate like everything
 *     else.
 * The durable path is the Places API or a licensed data provider;
 * treat this as a manually-triggered research aid, not a pipeline.
 */
export class MapsConnector implements SourceConnector {
  readonly kind = "maps_scrape" as const;
  readonly provider = "hyperbrowser";

  async *discover(query: Json): AsyncGenerator<RawRecord> {
    if (query.acknowledged_tos !== true) {
      throw new Error("maps sourcing requires the explicit --i-understand-tos flag");
    }
    const q = String(query.q);
    const url = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
    const md = await scrapeMarkdown(url);
    const seen = new Set<string>();
    // Best-effort extraction of "Name · rating (reviews)" style lines.
    for (const m of md.matchAll(/^#{0,3}\s*([A-Z][^\n·|]{2,70})$/gm)) {
      const name = (m[1] ?? "").trim();
      if (!name || seen.has(name.toLowerCase())) continue;
      if (/^(results|sponsored|directions|website|save|share|google|maps)$/i.test(name)) continue;
      seen.add(name.toLowerCase());
      yield {
        kind: "company",
        name,
        geo: String(query.geo ?? q),
        extra: { maps_query: q },
      };
    }
  }
}
