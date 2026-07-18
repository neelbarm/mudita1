import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cfg } from "../config.js";
import { enforceInsertInvariants } from "./port.js";
import type { ListOpts, StorePort } from "./port.js";
import type { Row, TableName, ViewName } from "./types.js";

/**
 * SupabaseStore: the production system of record. Service role key,
 * server-side only, same posture as the site's intake route. The code
 * invariants run first; the database constraints stay as the final
 * backstop (outbound_requires_approval, trg_block_opted_out, RLS).
 *
 * Internals cast to `any` at the supabase-js boundary: we type rows
 * ourselves in types.ts rather than carrying a generated Database
 * generic, and the two type systems fight without a cast.
 */
export class SupabaseStore implements StorePort {
  readonly kind = "supabase" as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: SupabaseClient<any, any, any>;

  constructor() {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SupabaseStore requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    }
    this.client = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async insert<T extends TableName>(table: T, row: Partial<Row<T>>): Promise<Row<T>> {
    await enforceInsertInvariants(this, table, row as Record<string, unknown>);
    const { data, error } = await this.client.from(table).insert(row as never).select().single();
    if (error) throw new Error(`insert ${table}: ${error.message}`);
    return data as Row<T>;
  }

  async update<T extends TableName>(table: T, id: string, patch: Partial<Row<T>>): Promise<Row<T>> {
    const { data, error } = await this.client
      .from(table)
      .update(patch as never)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`update ${table}/${id}: ${error.message}`);
    return data as Row<T>;
  }

  async get<T extends TableName>(table: T, id: string): Promise<Row<T> | null> {
    const { data, error } = await this.client.from(table).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`get ${table}/${id}: ${error.message}`);
    return (data as Row<T>) ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyOpts(q: any, opts: ListOpts<Record<string, unknown>>): any {
    const { where, lte, gte, isNull, notNull, orderBy, ascending = true, limit } = opts;
    if (where) {
      for (const [k, v] of Object.entries(where)) {
        q = Array.isArray(v) ? q.in(k, v) : q.eq(k, v);
      }
    }
    if (lte) for (const [k, v] of Object.entries(lte)) q = q.lte(k, v);
    if (gte) for (const [k, v] of Object.entries(gte)) q = q.gte(k, v);
    if (isNull) for (const k of isNull) q = q.is(k, null);
    if (notNull) for (const k of notNull) q = q.not(k, "is", null);
    if (orderBy) q = q.order(orderBy, { ascending });
    if (limit != null) q = q.limit(limit);
    return q;
  }

  async list<T extends TableName>(table: T, opts: ListOpts<Row<T>> = {}): Promise<Row<T>[]> {
    const q = this.applyOpts(this.client.from(table).select("*"), opts as ListOpts<Record<string, unknown>>);
    const { data, error } = await q;
    if (error) throw new Error(`list ${table}: ${error.message}`);
    return (data ?? []) as Row<T>[];
  }

  async count<T extends TableName>(table: T, opts: ListOpts<Row<T>> = {}): Promise<number> {
    const q = this.applyOpts(
      this.client.from(table).select("id", { count: "exact", head: true }),
      opts as ListOpts<Record<string, unknown>>,
    );
    const { count, error } = await q;
    if (error) throw new Error(`count ${table}: ${error.message}`);
    return count ?? 0;
  }

  async view(name: ViewName): Promise<Record<string, unknown>[]> {
    const { data, error } = await this.client.from(name).select("*");
    if (error) throw new Error(`view ${name}: ${error.message}`);
    return (data ?? []) as Record<string, unknown>[];
  }

  async isSuppressed(email: string): Promise<boolean> {
    // ilike with no wildcards = case-insensitive equality.
    const { data, error } = await this.client
      .from("suppressions")
      .select("id")
      .ilike("email", email)
      .limit(1);
    if (error) throw new Error(`isSuppressed: ${error.message}`);
    return (data ?? []).length > 0;
  }
}
