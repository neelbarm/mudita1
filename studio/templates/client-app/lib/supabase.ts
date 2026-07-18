/**
 * Server-side Supabase access, env-gated like every studio service:
 * absent keys degrade to null and callers no-op gracefully. Raw fetch,
 * service-role, NEVER imported into client components.
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured = Boolean(url && key);

export async function sbInsert(table: string, row: Record<string, unknown>): Promise<boolean> {
  if (!supabaseConfigured) {
    console.warn(`supabase not configured; skipped insert into ${table}`);
    return false;
  }
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key as string,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) console.error(`supabase insert ${table}: ${res.status}`);
  return res.ok;
}

export async function sbSelect(table: string, query: string): Promise<unknown[] | null> {
  if (!supabaseConfigured) return null;
  const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { apikey: key as string, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as unknown[];
}
