import type { Json } from "../../../os/store/types.js";
import { normalizeDomain } from "../../normalize.js";
import type { RawRecord, SourceConnector } from "../types.js";
import { scrapeMarkdown } from "./client.js";

/**
 * Site-signal crawl: read a company's own public pages and extract
 * typed signals (docs/07 step 4). First-party pages only; every
 * signal cites the exact URL it came from.
 */

const PAGES = ["", "/about", "/pricing", "/careers", "/contact", "/book"];

interface Rule {
  type: "hiring" | "launch" | "tooling_gap" | "manual_workflow_evidence" | "content";
  re: RegExp;
  detail: (m: string) => string;
}

const RULES: Rule[] = [
  { type: "hiring", re: /(we'?re hiring|join (our|the) team|open (roles|positions)|careers?)/i, detail: () => "Hiring language on their own site" },
  { type: "manual_workflow_evidence", re: /(dm (us|me) to book|book (via|by|through) (instagram|dm|text)|text (us|me) to (book|schedule)|call to book|email (us|me) to (book|schedule))/i, detail: (m) => `Manual booking path stated on site: "${m.trim()}"` },
  { type: "manual_workflow_evidence", re: /(fill (out|in) (this|the) (google )?form|respond within \d+ (hours|days)|we (reply|respond) personally)/i, detail: (m) => `Manual intake language: "${m.trim()}"` },
  { type: "tooling_gap", re: /(calendly|acuity|mindbody|square appointments|jane\.app)/i, detail: (m) => `Names a scheduling tool: ${m.trim()}` },
  { type: "launch", re: /(now open|grand opening|just launched|new location)/i, detail: (m) => `Launch language: "${m.trim()}"` },
];

export class SiteSignalsConnector implements SourceConnector {
  readonly kind = "site_signal_crawl" as const;
  readonly provider = "hyperbrowser";

  async *discover(query: Json): AsyncGenerator<RawRecord> {
    const domain = normalizeDomain(String(query.domain));
    if (!domain) throw new Error("site-signals needs a domain");
    for (const page of PAGES) {
      const url = `https://${domain}${page}`;
      let md = "";
      try {
        md = await scrapeMarkdown(url);
      } catch {
        continue; // missing pages are normal
      }
      if (!md) continue;
      const seen = new Set<string>();
      for (const rule of RULES) {
        const m = md.match(rule.re);
        if (m && !seen.has(rule.type + m[0])) {
          seen.add(rule.type + m[0]);
          yield {
            kind: "signal",
            domain,
            type: rule.type,
            detail: rule.detail(m[0]).slice(0, 300),
            url,
          };
        }
      }
    }
  }
}
