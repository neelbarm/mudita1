import { caps } from "./capabilities.js";
import { cfg } from "./config.js";
import { log } from "./log.js";

/**
 * Operator notifications: Slack incoming webhook when configured,
 * console otherwise. Notification failures never break a pipeline.
 */
export async function notify(text: string): Promise<void> {
  if (!caps.notifyLive()) {
    log.brass(`notify: ${text}`);
    return;
  }
  try {
    await fetch(cfg.SLACK_WEBHOOK_URL as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    log.warn("slack notify failed", err instanceof Error ? err.message : err);
  }
}
