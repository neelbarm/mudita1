import { caps } from "../../../os/capabilities.js";
import { cfg } from "../../../os/config.js";

/**
 * Hyperbrowser client, lazy and capability-gated. Pattern borrowed
 * from the sibling example apps (deep-crawler-bot, yc-research-bot).
 * Scrapes return markdown; extraction happens with plain heuristics
 * so results stay inspectable.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;

async function hb() {
  if (!caps.scrapeLive()) {
    throw new Error("Hyperbrowser is not configured. Set HYPERBROWSER_API_KEY, or use `sarga source csv`.");
  }
  if (!client) {
    const { Hyperbrowser } = await import("@hyperbrowser/sdk");
    client = new Hyperbrowser({ apiKey: cfg.HYPERBROWSER_API_KEY });
  }
  return client;
}

export async function scrapeMarkdown(url: string): Promise<string> {
  const c = await hb();
  const result = await c.scrape.startAndWait({
    url,
    scrapeOptions: { formats: ["markdown"], onlyMainContent: false },
  });
  return String(result?.data?.markdown ?? "");
}
