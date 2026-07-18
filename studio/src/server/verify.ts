import { createHmac, timingSafeEqual } from "node:crypto";
import { log } from "../os/log.js";

/**
 * Webhook signature verification. When a secret is configured the
 * signature MUST verify; when it is not, payloads are accepted with a
 * loud warning so local development works. Never silently strict,
 * never silently open.
 */

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

let warned = new Set<string>();
function warnOnce(which: string) {
  if (!warned.has(which)) {
    warned.add(which);
    log.warn(`${which} webhook secret not set: accepting UNVERIFIED payloads (dev mode)`);
  }
}

/** Svix-style (Resend): signed = "{id}.{timestamp}.{body}", base64 HMAC. */
export function verifySvix(secret: string | undefined, headers: Record<string, string | undefined>, body: string): boolean {
  if (!secret) {
    warnOnce("resend");
    return true;
  }
  const id = headers["svix-id"];
  const ts = headers["svix-timestamp"];
  const sigHeader = headers["svix-signature"];
  if (!id || !ts || !sigHeader) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
  return sigHeader.split(" ").some((part) => {
    const [, sig] = part.split(",");
    return sig != null && safeEqual(sig, expected);
  });
}

/** Stripe: header "t=...,v1=..."; signed = "{t}.{body}", hex HMAC. */
export function verifyStripe(secret: string | undefined, header: string | undefined, body: string): boolean {
  if (!secret) {
    warnOnce("stripe");
    return true;
  }
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  return safeEqual(v1, expected);
}

/** Cal.com: X-Cal-Signature-256 = hex HMAC of the body. */
export function verifyCalcom(secret: string | undefined, header: string | undefined, body: string): boolean {
  if (!secret) {
    warnOnce("cal.com");
    return true;
  }
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return safeEqual(header, expected);
}
