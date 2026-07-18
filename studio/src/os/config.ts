import { config as loadDotenv } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { z } from "zod";

/** Absolute path of the studio/ directory (this file lives at src/os/). */
export const STUDIO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

loadDotenv({ path: path.join(STUDIO_ROOT, ".env"), quiet: true });

const optional = z
  .string()
  .transform((s) => s.trim())
  .transform((s) => (s === "" ? undefined : s))
  .optional();

const optionalNumber = optional.transform((s) => {
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
});

const Env = z.object({
  STUDIO_OPERATOR: optional,
  STUDIO_PORT: optionalNumber,
  STUDIO_API_TOKEN: optional,
  STUDIO_BASE_URL: optional,
  STUDIO_MODEL: optional,

  SUPABASE_URL: optional,
  SUPABASE_SERVICE_ROLE_KEY: optional,
  SUPABASE_DB_URL: optional,

  ANTHROPIC_API_KEY: optional,

  HYPERBROWSER_API_KEY: optional,
  APOLLO_API_KEY: optional,
  HUNTER_API_KEY: optional,

  RESEND_API_KEY: optional,
  RESEND_WEBHOOK_SECRET: optional,
  OUTREACH_FROM_EMAIL: optional,
  INTAKE_NOTIFY_EMAIL: optional,
  STUDIO_POSTAL_ADDRESS: optional,
  UNSUBSCRIBE_SECRET: optional,
  MAX_DAILY_SENDS: optionalNumber,
  SEND_QUIET_HOURS: optional,

  STRIPE_API_KEY: optional,
  STRIPE_WEBHOOK_SECRET: optional,

  CALCOM_WEBHOOK_SECRET: optional,
  SLACK_WEBHOOK_URL: optional,

  STUDIO_MONTHLY_BURN: optionalNumber,
  STUDIO_CASH_ON_HAND: optionalNumber,

  PLAYWRIGHT_BROWSERS_PATH: optional,
  SENTRY_DSN: optional,
});

const parsed = Env.parse(process.env);

/** Resolved studio configuration. Every field optional; defaults live here. */
export const cfg = {
  ...parsed,
  operator: parsed.STUDIO_OPERATOR ?? "neel",
  port: parsed.STUDIO_PORT ?? 8787,
  model: parsed.STUDIO_MODEL ?? "claude-sonnet-5",
  maxDailySends: parsed.MAX_DAILY_SENDS ?? 15,
  quietHours: parsed.SEND_QUIET_HOURS ?? "20-07",
  playwrightBrowsersPath: parsed.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers",
} as const;

export type Cfg = typeof cfg;

/** The operator's actor string for the events log. */
export function humanActor(name?: string): string {
  return `human:${(name ?? cfg.operator).toLowerCase().replace(/[^a-z0-9-]+/g, "-")}`;
}

export const dir = {
  root: STUDIO_ROOT,
  runs: path.join(STUDIO_ROOT, "runs"),
  artifacts: path.join(STUDIO_ROOT, "artifacts"),
  outbox: path.join(STUDIO_ROOT, "outbox"),
  clients: path.join(STUDIO_ROOT, "clients"),
  fixtures: path.join(STUDIO_ROOT, "fixtures"),
  templates: path.join(STUDIO_ROOT, "templates"),
  local: path.join(STUDIO_ROOT, ".local"),
  prompts: path.join(STUDIO_ROOT, "src", "agents", "prompts"),
  skills: path.join(STUDIO_ROOT, "src", "agents", "skills"),
} as const;
