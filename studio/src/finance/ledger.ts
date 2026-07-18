import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { parse } from "csv-parse/sync";
import { getStore } from "../os/store/index.js";
import { log } from "../os/log.js";
import type { LedgerEntry } from "../os/store/types.js";

/**
 * The manual/CSV side of the ledger: the no-Stripe fallback. Imports
 * are idempotent: rows hash to an external_id so re-importing the
 * same file adds nothing.
 * CSV headers: date, kind, amount, currency?, counterparty?, memo?,
 * due_date?, status?
 */

export async function importLedgerCsv(file: string): Promise<{ added: number; skipped: number }> {
  const store = getStore();
  const rows = parse(readFileSync(file, "utf8"), {
    columns: (h: string[]) => h.map((c) => c.trim().toLowerCase()),
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const existing = new Set(
    (await store.list("ledger_entries")).map((l) => l.external_id).filter(Boolean) as string[],
  );

  let added = 0;
  let skipped = 0;
  for (const row of rows) {
    const kind = (row.kind ?? "").toLowerCase();
    if (!["invoice", "payment", "expense", "refund", "credit"].includes(kind)) {
      log.warn(`ledger import: skipping row with kind "${row.kind}"`);
      skipped += 1;
      continue;
    }
    const externalId =
      "csv-" +
      createHash("sha256")
        .update([row.date, kind, row.amount, row.counterparty ?? "", row.memo ?? ""].join("|"))
        .digest("hex")
        .slice(0, 16);
    if (existing.has(externalId)) {
      skipped += 1;
      continue;
    }
    existing.add(externalId);
    await store.insert("ledger_entries", {
      entry_date: row.date,
      kind: kind as LedgerEntry["kind"],
      amount: Number(row.amount),
      currency: (row.currency ?? "usd").toLowerCase(),
      counterparty: row.counterparty || null,
      memo: row.memo || null,
      due_date: row.due_date || null,
      status: (row.status as LedgerEntry["status"]) || (kind === "invoice" ? "open" : "paid"),
      source: "csv",
      external_id: externalId,
    });
    added += 1;
  }
  return { added, skipped };
}
