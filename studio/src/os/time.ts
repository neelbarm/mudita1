/** Pure time helpers. Everything takes an explicit `now` so tests control the clock. */

export function nowIso(now: Date = new Date()): string {
  return now.toISOString();
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function addHours(iso: string, hours: number): string {
  const d = new Date(iso);
  d.setUTCHours(d.getUTCHours() + hours);
  return d.toISOString();
}

export function daysBetween(aIso: string, bIso: string): number {
  return Math.floor((new Date(bIso).getTime() - new Date(aIso).getTime()) / 86_400_000);
}

/**
 * Quiet hours "20-07" means: no sends from 20:00 up to 07:00 (local time).
 * A window like "09-17" (start < end) blocks inside 09:00..17:00 instead.
 */
export function inQuietHours(spec: string, now: Date = new Date()): boolean {
  const m = spec.match(/^(\d{1,2})-(\d{1,2})$/);
  if (!m) return false;
  const start = Number(m[1]);
  const end = Number(m[2]);
  const h = now.getHours();
  if (start === end) return false;
  if (start < end) return h >= start && h < end;
  return h >= start || h < end; // wraps midnight
}

/** Same UTC calendar day. */
export function sameDay(aIso: string, bIso: string): boolean {
  return aIso.slice(0, 10) === bIso.slice(0, 10);
}
