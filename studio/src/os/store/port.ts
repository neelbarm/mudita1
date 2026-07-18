import type { Row, TableName, ViewName } from "./types.js";

/**
 * StorePort: the one seam between the studio and its system of record.
 * Two implementations: SupabaseStore (service role) and LocalStore
 * (.local/db.json). Everything above this line is store-agnostic.
 */

export type Scalar = string | number | boolean | null;

export interface ListOpts<T> {
  /** Equality (scalar) or IN (array) per column. */
  where?: Partial<Record<Extract<keyof T, string>, Scalar | Scalar[]>>;
  /** column <= value */
  lte?: Partial<Record<Extract<keyof T, string>, Scalar>>;
  /** column >= value */
  gte?: Partial<Record<Extract<keyof T, string>, Scalar>>;
  isNull?: Array<Extract<keyof T, string>>;
  notNull?: Array<Extract<keyof T, string>>;
  orderBy?: Extract<keyof T, string>;
  ascending?: boolean;
  limit?: number;
}

export interface StorePort {
  readonly kind: "supabase" | "local";
  insert<T extends TableName>(table: T, row: Partial<Row<T>>): Promise<Row<T>>;
  update<T extends TableName>(table: T, id: string, patch: Partial<Row<T>>): Promise<Row<T>>;
  get<T extends TableName>(table: T, id: string): Promise<Row<T> | null>;
  list<T extends TableName>(table: T, opts?: ListOpts<Row<T>>): Promise<Row<T>[]>;
  count<T extends TableName>(table: T, opts?: ListOpts<Row<T>>): Promise<number>;
  view(name: ViewName): Promise<Record<string, unknown>[]>;
  /** Case-insensitive check against the permanent suppression list. */
  isSuppressed(email: string): Promise<boolean>;
}

export class StoreInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreInvariantError";
  }
}

/**
 * The two non-negotiable write invariants, enforced in code so the
 * LocalStore is exactly as strict as the Postgres schema:
 *
 * 1. Outbound touches require a named human approver
 *    (mirror of touches.outbound_requires_approval).
 * 2. Opted-out or suppressed contacts can never be enrolled
 *    (mirror of trg_block_opted_out, plus the suppressions list).
 *
 * Both stores call this before every insert. Supabase would also refuse
 * at the database layer; that stays as the final backstop.
 */
export async function enforceInsertInvariants(
  store: StorePort,
  table: TableName,
  row: Record<string, unknown>,
): Promise<void> {
  if (table === "touches") {
    if (row.direction === "outbound" && !row.approved_by) {
      throw new StoreInvariantError(
        "outbound touch requires approved_by: a named human approver. Non-negotiable.",
      );
    }
  }
  if (table === "enrollments") {
    const contactId = row.contact_id as string;
    const contact = await store.get("contacts", contactId);
    if (!contact) throw new StoreInvariantError(`enrollment references missing contact ${contactId}`);
    if (contact.opted_out_at) {
      throw new StoreInvariantError(`contact ${contactId} is suppressed (opted out)`);
    }
    if (contact.email && (await store.isSuppressed(contact.email))) {
      throw new StoreInvariantError(`contact ${contactId} email is on the permanent suppression list`);
    }
  }
  if (table === "approvals") {
    const status = (row.status as string) ?? "pending";
    if (!["pending", "expired"].includes(status) && !row.decided_by) {
      throw new StoreInvariantError("approval decisions require decided_by: a named human");
    }
  }
  if (table === "facts") {
    if (!row.source_url) {
      throw new StoreInvariantError("facts require source_url: cite it or discard it (docs/08 rule 4)");
    }
  }
}
