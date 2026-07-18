import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { caps } from "../../os/capabilities.js";
import { cfg, dir } from "../../os/config.js";
import { log } from "../../os/log.js";
import { runId } from "../../os/ids.js";
import { unsubscribeUrl } from "./unsubscribe.js";

/**
 * Outbound email: Resend when keys exist, outbox/ JSON files when
 * they do not. Same raw-fetch pattern as the site's intake route; no
 * SDK. Every message carries List-Unsubscribe headers.
 */

export interface OutboundEmail {
  to: string;
  subject: string;
  text: string;
}

export interface SendResult {
  mode: "resend" | "outbox";
  ref: string;
}

export async function sendEmail(mail: OutboundEmail): Promise<SendResult> {
  const unsub = unsubscribeUrl(mail.to);

  if (!caps.emailOutLive()) {
    mkdirSync(dir.outbox, { recursive: true });
    const ref = path.join(dir.outbox, `${runId()}.json`);
    writeFileSync(ref, JSON.stringify({ ...mail, list_unsubscribe: unsub, queued_at: new Date().toISOString() }, null, 2));
    log.warn(`email out is in outbox mode: wrote ${ref}`);
    return { mode: "outbox", ref };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: cfg.OUTREACH_FROM_EMAIL,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      headers: {
        "List-Unsubscribe": `<${unsub}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`resend send failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { id?: string };
  return { mode: "resend", ref: data.id ?? "unknown" };
}
