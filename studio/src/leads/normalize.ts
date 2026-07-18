/** Deterministic normalizers. Pure functions, unit-tested. */

const TWO_PART_TLDS = new Set(["co.uk", "com.au", "co.nz", "co.jp", "com.br", "co.in"]);

/** Lowercased registrable domain: strips scheme, path, www. */
export function normalizeDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  let host = input.trim().toLowerCase();
  host = host.replace(/^[a-z]+:\/\//, "").split(/[/?#]/, 1)[0] ?? "";
  host = host.replace(/^www\./, "").replace(/\.$/, "");
  if (!host.includes(".")) return null;
  const labels = host.split(".");
  const lastTwo = labels.slice(-2).join(".");
  if (TWO_PART_TLDS.has(lastTwo) && labels.length >= 3) {
    return labels.slice(-3).join(".");
  }
  return lastTwo.includes(".") ? labels.slice(-2).join(".") : host;
}

const LEGAL_SUFFIXES = /\b(llc|inc|incorporated|ltd|limited|gmbh|corp|corporation|co|company|pllc|llp|plc)\.?$/i;

/** Company name for dedupe: lowercase, no legal suffix, single spaces. */
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s&-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(LEGAL_SUFFIXES, "")
    .trim();
}

export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null;
}
