import { randomUUID } from "node:crypto";

export function uuid(): string {
  return randomUUID();
}

/** Sortable, human-scannable run id: 20260718-143512-a1b2c3 */
export function runId(): string {
  const d = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `${stamp}-${randomUUID().slice(0, 6)}`;
}

/** URL/file-safe slug. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
