import { existsSync } from "node:fs";
import { cfg } from "./config.js";

/**
 * The capability matrix: what runs live vs degraded, derived purely from
 * config. Everything else in the studio consults this instead of peeking
 * at env keys, so degradation decisions live in exactly one place.
 */

export type Capability = {
  key: string;
  mode: string;
  live: boolean;
  /** Env var(s) that would unlock the live mode when degraded. */
  unlock?: string;
  note?: string;
};

export function capabilities(): Capability[] {
  const db = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_SERVICE_ROLE_KEY);
  const agents = Boolean(cfg.ANTHROPIC_API_KEY);
  const scrape = Boolean(cfg.HYPERBROWSER_API_KEY);
  const enrich = cfg.APOLLO_API_KEY ? "apollo" : cfg.HUNTER_API_KEY ? "hunter" : null;
  const emailOut = Boolean(cfg.RESEND_API_KEY && cfg.OUTREACH_FROM_EMAIL);
  const emailIn = Boolean(cfg.RESEND_WEBHOOK_SECRET);
  const billing = Boolean(cfg.STRIPE_API_KEY);
  const booking = Boolean(cfg.CALCOM_WEBHOOK_SECRET);
  const notify = Boolean(cfg.SLACK_WEBHOOK_URL);
  const qa = existsSync(cfg.playwrightBrowsersPath);
  const dbPush = Boolean(cfg.SUPABASE_DB_URL);
  const canSpam = Boolean(cfg.STUDIO_POSTAL_ADDRESS);

  return [
    { key: "db", live: db, mode: db ? "supabase" : "local json (.local/db.json)", unlock: db ? undefined : "SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY" },
    { key: "db push", live: dbPush, mode: dbPush ? "psql" : "print SQL (sarga db print)", unlock: dbPush ? undefined : "SUPABASE_DB_URL" },
    { key: "agents", live: agents, mode: agents ? `live (${cfg.model})` : "dry-run from fixtures", unlock: agents ? undefined : "ANTHROPIC_API_KEY" },
    { key: "scrape", live: scrape, mode: scrape ? "hyperbrowser" : "off (csv import only)", unlock: scrape ? undefined : "HYPERBROWSER_API_KEY" },
    { key: "enrich", live: Boolean(enrich), mode: enrich ?? "off (fields stay unverified)", unlock: enrich ? undefined : "APOLLO_API_KEY or HUNTER_API_KEY" },
    { key: "email out", live: emailOut, mode: emailOut ? "resend" : "outbox/ json files", unlock: emailOut ? undefined : "RESEND_API_KEY + OUTREACH_FROM_EMAIL" },
    { key: "email in", live: emailIn, mode: emailIn ? "resend webhook" : "off (paste replies via CLI)", unlock: emailIn ? undefined : "RESEND_WEBHOOK_SECRET" },
    {
      key: "can-spam", live: canSpam, mode: canSpam ? "postal address set" : "LIVE SEND REFUSED (no postal address)",
      unlock: canSpam ? undefined : "STUDIO_POSTAL_ADDRESS",
      note: canSpam ? undefined : "outbox mode still works",
    },
    { key: "billing", live: billing, mode: billing ? "stripe" : "csv/manual ledger", unlock: billing ? undefined : "STRIPE_API_KEY" },
    { key: "booking", live: booking, mode: booking ? "cal.com webhook" : "manual", unlock: booking ? undefined : "CALCOM_WEBHOOK_SECRET" },
    { key: "notify", live: notify, mode: notify ? "slack" : "log only", unlock: notify ? undefined : "SLACK_WEBHOOK_URL" },
    { key: "qa browsers", live: qa, mode: qa ? cfg.playwrightBrowsersPath : "playwright browsers missing", unlock: qa ? undefined : "PLAYWRIGHT_BROWSERS_PATH or npx playwright install chromium" },
  ];
}

export const caps = {
  dbIsSupabase: () => Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_SERVICE_ROLE_KEY),
  agentsLive: () => Boolean(cfg.ANTHROPIC_API_KEY),
  scrapeLive: () => Boolean(cfg.HYPERBROWSER_API_KEY),
  enrichProvider: (): "apollo" | "hunter" | null =>
    cfg.APOLLO_API_KEY ? "apollo" : cfg.HUNTER_API_KEY ? "hunter" : null,
  emailOutLive: () => Boolean(cfg.RESEND_API_KEY && cfg.OUTREACH_FROM_EMAIL),
  billingLive: () => Boolean(cfg.STRIPE_API_KEY),
  notifyLive: () => Boolean(cfg.SLACK_WEBHOOK_URL),
};
