import { caps } from "../os/capabilities.js";
import { cfg } from "../os/config.js";
import { inQuietHours, sameDay } from "../os/time.js";
import type { StorePort } from "../os/store/index.js";
import type { Contact } from "../os/store/types.js";
import { unsubscribeUrl } from "./mail/unsubscribe.js";

/**
 * The compliance gate for every outbound email. Each named rule in
 * docs/07 maps to a check here and a line in docs/COMPLIANCE.md.
 * assertSendable runs INSIDE the send effector, after human approval:
 * approval never overrides compliance.
 */

export class ComplianceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComplianceError";
  }
}

export async function assertSendable(
  store: StorePort,
  contact: Contact,
  opts: { now?: Date } = {},
): Promise<void> {
  const now = opts.now ?? new Date();

  if (contact.opted_out_at) {
    throw new ComplianceError("contact opted out; suppression is permanent");
  }
  if (!contact.email) throw new ComplianceError("contact has no email");
  if (await store.isSuppressed(contact.email)) {
    throw new ComplianceError("email is on the permanent suppression list");
  }
  if (contact.email_status !== "verified") {
    throw new ComplianceError(`email status is ${contact.email_status}; only verified addresses send`);
  }

  // Live-send-only rules; outbox mode records drafts without sending.
  if (caps.emailOutLive()) {
    if (!cfg.STUDIO_POSTAL_ADDRESS) {
      throw new ComplianceError("no postal address configured; CAN-SPAM requires one. Set STUDIO_POSTAL_ADDRESS.");
    }
    if (inQuietHours(cfg.quietHours, now)) {
      throw new ComplianceError(`inside quiet hours (${cfg.quietHours}); try again in the morning`);
    }
    const todayIso = now.toISOString();
    const outboundToday = (
      await store.list("touches", { where: { direction: "outbound", channel: "email" } })
    ).filter((t) => sameDay(t.created_at, todayIso)).length;
    if (outboundToday >= cfg.maxDailySends) {
      throw new ComplianceError(`daily send cap reached (${cfg.maxDailySends}). Low volume is the policy, not a limit to raise.`);
    }
  }
}

/** CAN-SPAM footer: identity, postal address, working unsubscribe. */
export function emailFooter(email: string): string {
  const postal = cfg.STUDIO_POSTAL_ADDRESS ?? "[postal address not configured]";
  const unsub = unsubscribeUrl(email);
  return [
    "",
    "--",
    "Sarga Haus",
    postal,
    `No more emails from us: ${unsub}`,
  ].join("\n");
}
