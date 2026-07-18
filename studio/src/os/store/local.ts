import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { dir } from "../config.js";
import { uuid } from "../ids.js";
import { nowIso } from "../time.js";
import { enforceInsertInvariants, StoreInvariantError } from "./port.js";
import type { ListOpts, Scalar, StorePort } from "./port.js";
import type { Row, TableName, ViewName } from "./types.js";

/**
 * LocalStore: the key-free system of record. One JSON file, the same
 * invariants as Postgres, the same views computed in JS. Good for a
 * single operator, tests, and simulations; swaps for Supabase the
 * moment keys exist, with zero changes above the StorePort seam.
 */

const TRACKED = new Set<TableName>([
  "intake_submissions", "accounts", "contacts", "enrollments", "opportunities",
  "projects", "agent_runs", "approvals", "facts", "source_jobs", "briefs",
  "design_specs", "build_runs", "ledger_entries",
]);
const NO_CREATED = new Set<TableName>(["sequence_steps"]);

type Db = Partial<Record<TableName, Record<string, unknown>[]>>;

export class LocalStore implements StorePort {
  readonly kind = "local" as const;
  private db: Db;
  private file: string;

  constructor(file?: string) {
    this.file = file ?? process.env.STUDIO_LOCAL_DB ?? path.join(dir.local, "db.json");
    this.db = existsSync(this.file)
      ? (JSON.parse(readFileSync(this.file, "utf8")) as Db)
      : {};
  }

  private rows<T extends TableName>(table: T): Record<string, unknown>[] {
    return (this.db[table] ??= []);
  }

  private persist() {
    mkdirSync(path.dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify(this.db, null, 1));
  }

  async insert<T extends TableName>(table: T, row: Partial<Row<T>>): Promise<Row<T>> {
    await enforceInsertInvariants(this, table, row as Record<string, unknown>);
    const now = nowIso();
    const full: Record<string, unknown> = { ...row };
    full.id ??= uuid();
    if (!NO_CREATED.has(table)) full.created_at ??= now;
    if (TRACKED.has(table)) full.updated_at ??= now;
    this.rows(table).push(full);
    this.persist();
    return full as unknown as Row<T>;
  }

  async update<T extends TableName>(table: T, id: string, patch: Partial<Row<T>>): Promise<Row<T>> {
    const row = this.rows(table).find((r) => r.id === id);
    if (!row) throw new Error(`${table}/${id} not found`);
    const p = patch as Record<string, unknown>;
    if (table === "approvals") {
      const nextStatus = (p.status as string) ?? (row.status as string);
      if (["approved", "rejected"].includes(nextStatus) && !(p.decided_by ?? row.decided_by)) {
        throw new StoreInvariantError("approval decisions require decided_by: a named human");
      }
    }
    Object.assign(row, p);
    if (TRACKED.has(table)) row.updated_at = nowIso();
    this.persist();
    return row as unknown as Row<T>;
  }

  async get<T extends TableName>(table: T, id: string): Promise<Row<T> | null> {
    return (this.rows(table).find((r) => r.id === id) as Row<T> | undefined) ?? null;
  }

  async list<T extends TableName>(table: T, opts: ListOpts<Row<T>> = {}): Promise<Row<T>[]> {
    let rows = [...this.rows(table)];
    const { where, lte, gte, isNull, notNull, orderBy, ascending = true, limit } = opts as ListOpts<Record<string, unknown>>;
    if (where) {
      for (const [k, v] of Object.entries(where)) {
        rows = Array.isArray(v)
          ? rows.filter((r) => (v as Scalar[]).includes(r[k] as Scalar))
          : rows.filter((r) => r[k] === v);
      }
    }
    if (lte) for (const [k, v] of Object.entries(lte)) rows = rows.filter((r) => (r[k] as never) <= (v as never));
    if (gte) for (const [k, v] of Object.entries(gte)) rows = rows.filter((r) => (r[k] as never) >= (v as never));
    if (isNull) for (const k of isNull) rows = rows.filter((r) => r[k] == null);
    if (notNull) for (const k of notNull) rows = rows.filter((r) => r[k] != null);
    if (orderBy) {
      rows.sort((a, b) => {
        const av = a[orderBy] as never;
        const bv = b[orderBy] as never;
        return av < bv ? (ascending ? -1 : 1) : av > bv ? (ascending ? 1 : -1) : 0;
      });
    }
    if (limit != null) rows = rows.slice(0, limit);
    return rows as unknown as Row<T>[];
  }

  async count<T extends TableName>(table: T, opts?: ListOpts<Row<T>>): Promise<number> {
    return (await this.list(table, opts)).length;
  }

  async isSuppressed(email: string): Promise<boolean> {
    const lower = email.toLowerCase();
    return this.rows("suppressions").some((s) => String(s.email).toLowerCase() === lower);
  }

  // ------------------------------------------------------------- views ----
  // JS twins of the SQL views. Same semantics, one operator's scale.

  async view(name: ViewName): Promise<Record<string, unknown>[]> {
    const now = Date.now();
    const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString();
    const within = (iso: unknown, days: number) => typeof iso === "string" && iso > daysAgo(days);

    switch (name) {
      case "v_pipeline": {
        const open = this.rows("opportunities").filter((o) => !["won", "lost"].includes(o.stage as string));
        const byStage = new Map<string, { deals: number; value: number; ages: number[] }>();
        for (const o of open) {
          const g = byStage.get(o.stage as string) ?? { deals: 0, value: 0, ages: [] };
          g.deals += 1;
          g.value += Number(o.value_estimate ?? 0);
          g.ages.push((now - new Date(o.created_at as string).getTime()) / 86_400_000);
          byStage.set(o.stage as string, g);
        }
        return [...byStage.entries()].map(([stage, g]) => ({
          stage, deals: g.deals, value: g.value,
          avg_age_days: Math.round(g.ages.reduce((a, b) => a + b, 0) / g.ages.length),
        }));
      }
      case "v_lead_flow": {
        const byWeek = new Map<string, number>();
        for (const a of this.rows("accounts")) {
          const week = (a.created_at as string).slice(0, 10);
          const key = `${week}|${a.status}`;
          byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
        }
        return [...byWeek.entries()].map(([k, accounts]) => {
          const [week, status] = k.split("|");
          return { week, status, accounts };
        });
      }
      case "v_intake_quality": {
        const g = new Map<string, number>();
        for (const s of this.rows("intake_submissions")) {
          const key = `${s.category}|${s.budget}|${s.status}`;
          g.set(key, (g.get(key) ?? 0) + 1);
        }
        return [...g.entries()].map(([k, submissions]) => {
          const [category, budget, status] = k.split("|");
          return { category, budget, status, submissions };
        });
      }
      case "v_stalled": {
        const cutoff = daysAgo(14);
        return [
          ...this.rows("enrollments")
            .filter((e) => e.state === "active" && (e.updated_at as string) < cutoff)
            .map((e) => ({ kind: "enrollment", id: e.id, updated_at: e.updated_at })),
          ...this.rows("opportunities")
            .filter((o) => ["discovery", "proposal", "negotiation"].includes(o.stage as string) && (o.updated_at as string) < cutoff)
            .map((o) => ({ kind: "opportunity", id: o.id, updated_at: o.updated_at })),
        ];
      }
      case "v_approval_queue": {
        const runs = new Map(this.rows("agent_runs").map((r) => [r.id as string, r.agent as string]));
        return this.rows("approvals")
          .filter((a) => a.status === "pending")
          .sort((a, b) => ((a.created_at as string) < (b.created_at as string) ? -1 : 1))
          .map((a) => ({
            id: a.id, kind: a.kind, title: a.title, summary: a.summary,
            entity: a.entity, entity_id: a.entity_id, created_at: a.created_at,
            age_hours: Math.floor((now - new Date(a.created_at as string).getTime()) / 3_600_000),
            drafted_by: a.agent_run_id ? (runs.get(a.agent_run_id as string) ?? null) : null,
          }));
      }
      case "v_outreach_ready": {
        const accounts = new Map(this.rows("accounts").map((a) => [a.id as string, a]));
        const out: Record<string, unknown>[] = [];
        for (const c of this.rows("contacts")) {
          if (c.email_status !== "verified" || c.opted_out_at != null || !c.email) continue;
          if (await this.isSuppressed(c.email as string)) continue;
          const acct = accounts.get(c.account_id as string);
          if (!acct || Number(acct.icp_score ?? 0) < 60) continue;
          const approvedFacts = this.rows("facts").filter(
            (f) => f.account_id === c.account_id && f.status === "approved",
          ).length;
          if (approvedFacts < 3) continue;
          const enrollment = this.rows("enrollments").find(
            (e) => e.contact_id === c.id && ["draft", "active", "pending_approval"].includes(e.state as string),
          );
          out.push({
            contact_id: c.id, account_id: c.account_id, full_name: c.full_name,
            email: c.email, icp_score: acct.icp_score, approved_facts: approvedFacts,
            enrollment_id: enrollment?.id ?? null,
          });
        }
        return out;
      }
      case "v_weekly_metrics": {
        const events = this.rows("events");
        const touches = this.rows("touches");
        return [{
          accounts_researched: this.rows("accounts").filter((a) => within(a.created_at, 7)).length,
          qualified: events.filter((e) => e.entity === "account" && e.action === "account.qualified" && within(e.created_at, 7)).length,
          contacted: touches.filter((t) => t.direction === "outbound" && t.approved_by != null && within(t.created_at, 7)).length,
          replies: touches.filter((t) => t.direction === "inbound" && within(t.created_at, 7)).length,
          conversations: events.filter((e) => e.entity === "account" && e.action === "account.conversation" && within(e.created_at, 7)).length,
          opportunities: this.rows("opportunities").filter((o) => within(o.created_at, 7)).length,
          pipeline_value: this.rows("opportunities")
            .filter((o) => !["won", "lost"].includes(o.stage as string))
            .reduce((s, o) => s + Number(o.value_estimate ?? 0), 0),
        }];
      }
      case "v_cash": {
        const led = this.rows("ledger_entries");
        const sum = (rows: Record<string, unknown>[]) => rows.reduce((s, r) => s + Number(r.amount ?? 0), 0);
        return [{
          open_invoices: sum(led.filter((l) => l.kind === "invoice" && l.status === "open")),
          overdue_invoices: sum(led.filter((l) => l.kind === "invoice" && l.status === "overdue")),
          received_30d: sum(led.filter((l) => l.kind === "payment" && within(l.entry_date + "T00:00:00Z", 30))),
          spent_30d: sum(led.filter((l) => l.kind === "expense" && within(l.entry_date + "T00:00:00Z", 30))),
        }];
      }
    }
  }
}
