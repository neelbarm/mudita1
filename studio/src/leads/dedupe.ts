import { normalizeCompanyName, normalizeDomain, normalizeEmail } from "./normalize.js";

/**
 * Dedupe keys for raw source records. Domain wins; otherwise the
 * normalized name plus geo. People key on email, falling back to
 * name-at-company.
 */

export function companyDedupeKey(r: { name?: string | null; domain?: string | null; geo?: string | null }): string {
  const domain = normalizeDomain(r.domain);
  if (domain) return `d:${domain}`;
  const name = normalizeCompanyName(r.name ?? "");
  const geo = (r.geo ?? "").trim().toLowerCase();
  return `n:${name}${geo ? `|${geo}` : ""}`;
}

export function personDedupeKey(r: { email?: string | null; full_name?: string | null; company?: string | null }): string {
  const email = normalizeEmail(r.email);
  if (email) return `e:${email}`;
  return `p:${(r.full_name ?? "").trim().toLowerCase()}@${normalizeCompanyName(r.company ?? "")}`;
}
