import { caps } from "../os/capabilities.js";
import { cfg } from "../os/config.js";
import { log } from "../os/log.js";
import { getStore } from "../os/store/index.js";

/**
 * Stripe mirror (raw fetch, no SDK): invoices sync into the ledger,
 * webhooks flip paid/overdue. Absent key, finance runs on CSV/manual
 * entries and the doctor says so.
 */

export async function syncStripeInvoices(): Promise<{ synced: number }> {
  if (!caps.billingLive()) {
    log.warn("stripe is not configured; ledger runs on csv/manual entries");
    return { synced: 0 };
  }
  const store = getStore();
  const res = await fetch("https://api.stripe.com/v1/invoices?limit=100", {
    headers: { Authorization: `Bearer ${cfg.STRIPE_API_KEY}` },
  });
  if (!res.ok) throw new Error(`stripe invoices: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { data: Array<Record<string, unknown>> };

  const existing = new Set(
    (await store.list("ledger_entries")).map((l) => l.external_id).filter(Boolean) as string[],
  );
  let synced = 0;
  for (const inv of data.data) {
    const id = `stripe-${inv.id}`;
    if (existing.has(id)) continue;
    const amount = Number(inv.amount_due ?? 0) / 100;
    const status =
      inv.status === "paid" ? "paid" : inv.status === "void" ? "void" : "open";
    await store.insert("ledger_entries", {
      entry_date: new Date(Number(inv.created) * 1000).toISOString().slice(0, 10),
      kind: "invoice",
      amount,
      currency: String(inv.currency ?? "usd"),
      counterparty: String((inv.customer_name as string) ?? (inv.customer_email as string) ?? "unknown"),
      memo: String(inv.number ?? inv.id),
      due_date: inv.due_date ? new Date(Number(inv.due_date) * 1000).toISOString().slice(0, 10) : null,
      status,
      source: "stripe",
      external_id: id,
    });
    synced += 1;
  }
  return { synced };
}

/** Webhook: invoice.paid / invoice.payment_failed / invoice.overdue. */
export async function handleStripeEvent(event: { type: string; data: { object: Record<string, unknown> } }): Promise<void> {
  const store = getStore();
  const obj = event.data.object;
  const externalId = `stripe-${obj.id}`;
  const entries = await store.list("ledger_entries", { where: { external_id: externalId } });
  const entry = entries[0];

  if (event.type === "invoice.paid") {
    if (entry) await store.update("ledger_entries", entry.id, { status: "paid" });
    const amount = Number(obj.amount_paid ?? 0) / 100;
    await store.insert("ledger_entries", {
      entry_date: new Date().toISOString().slice(0, 10),
      kind: "payment",
      amount,
      currency: String(obj.currency ?? "usd"),
      counterparty: String((obj.customer_name as string) ?? "unknown"),
      memo: `payment for ${obj.number ?? obj.id}`,
      status: "paid",
      source: "stripe",
      external_id: `stripe-pay-${obj.id}`,
    });
  } else if (event.type === "invoice.payment_failed" || event.type === "invoice.marked_uncollectible") {
    if (entry) await store.update("ledger_entries", entry.id, { status: "overdue" });
  }
}
