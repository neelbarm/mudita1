import { createHmac, timingSafeEqual } from "node:crypto";
import { cfg, humanActor } from "../../os/config.js";
import { writeEvent } from "../../os/events.js";
import { getStore } from "../../os/store/index.js";

/**
 * One-click unsubscribe: an HMAC token per address, honored instantly
 * and permanently. The suppression row survives contact deletion and
 * re-import; the DB trigger and the code guards both consult it.
 */

function secret(): string {
  return cfg.UNSUBSCRIBE_SECRET ?? "sarga-dev-unsubscribe-secret";
}

export function unsubscribeToken(email: string): string {
  const e = email.trim().toLowerCase();
  const mac = createHmac("sha256", secret()).update(e).digest("hex").slice(0, 24);
  return `${Buffer.from(e).toString("base64url")}.${mac}`;
}

export function unsubscribeUrl(email: string): string {
  const base = cfg.STUDIO_BASE_URL ?? `http://localhost:${cfg.port}`;
  return `${base}/u/${unsubscribeToken(email)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const [b64, mac] = token.split(".");
  if (!b64 || !mac) return null;
  try {
    const email = Buffer.from(b64, "base64url").toString("utf8");
    const expected = createHmac("sha256", secret()).update(email).digest("hex").slice(0, 24);
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return email;
  } catch {
    return null;
  }
}

/** Permanent suppression: the one-way door. */
export async function suppress(
  email: string,
  reason: "opt_out" | "hard_bounce" | "manual" | "legal",
  source: string,
): Promise<void> {
  const store = getStore();
  const lower = email.trim().toLowerCase();
  if (!(await store.isSuppressed(lower))) {
    await store.insert("suppressions", {
      email: lower,
      domain: lower.split("@")[1] ?? null,
      reason,
      source,
    });
  }
  // Mark every matching contact opted out and kill their enrollments.
  const contacts = (await store.list("contacts")).filter(
    (c) => (c.email ?? "").toLowerCase() === lower,
  );
  for (const c of contacts) {
    await store.update("contacts", c.id, {
      opted_out_at: new Date().toISOString(),
      email_status: reason === "hard_bounce" ? "bounced" : "opted_out",
    });
    const enrollments = await store.list("enrollments", { where: { contact_id: c.id } });
    for (const e of enrollments) {
      if (!["finished", "opted_out"].includes(e.state)) {
        await store.update("enrollments", e.id, { state: "opted_out", next_action_at: null });
      }
    }
    // The recipient made this decision; record it as theirs.
    await writeEvent({
      entity: "contact",
      entityId: c.id,
      actor: humanActor("recipient"),
      action: "contact.suppressed",
      detail: { reason, source },
    });
  }
}
