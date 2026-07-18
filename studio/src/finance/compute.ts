import { cfg } from "../os/config.js";
import type { StorePort } from "../os/store/index.js";
import type { LedgerEntry, Offer } from "../os/store/types.js";

/**
 * All finance FIGURES are computed here, deterministically, from the
 * ledger and the pipeline. The Finance Analyst narrates this object
 * and may not add a single number to it (the runner enforces that).
 */

export const DUNNING_DAYS = [3, 7, 10, 14] as const;

export interface DunningCandidate {
  invoice_ref: string;
  ledger_id: string;
  amount: number;
  counterparty: string | null;
  days_overdue: number;
  /** the escalation stage this candidate has reached */
  stage: 3 | 7 | 10 | 14;
}

export interface ComputedFinance {
  as_of: string;
  cash: { open_invoices: number; overdue_invoices: number; received_30d: number; spent_30d: number };
  pnl_month: { received: number; spent: number; net: number };
  dunning: DunningCandidate[];
  unit_economics: Array<{ offer: Offer; won: number; total_value: number; avg_value: number }>;
  budget_vs_actual: Array<{ project_id: string; invoiced: number; collected: number; spent: number }>;
  runway_months: number | null;
  policy: { dunning_days: number[]; payment_split: string };
}

export async function computeFinance(store: StorePort, now: Date = new Date()): Promise<ComputedFinance> {
  const ledger = await store.list("ledger_entries");
  const nowMs = now.getTime();
  const iso = now.toISOString();
  const monthKey = iso.slice(0, 7);
  const within = (dateIso: string | null, days: number) =>
    dateIso != null && nowMs - new Date(dateIso).getTime() <= days * 86_400_000;

  const sum = (rows: LedgerEntry[]) => round2(rows.reduce((s, r) => s + Number(r.amount), 0));

  const invoices = ledger.filter((l) => l.kind === "invoice");
  const payments = ledger.filter((l) => l.kind === "payment");
  const expenses = ledger.filter((l) => l.kind === "expense");

  const cash = {
    open_invoices: sum(invoices.filter((l) => l.status === "open")),
    overdue_invoices: sum(invoices.filter((l) => l.status === "overdue" || isOverdue(l, now))),
    received_30d: sum(payments.filter((l) => within(l.entry_date, 30))),
    spent_30d: sum(expenses.filter((l) => within(l.entry_date, 30))),
  };

  const monthPayments = sum(payments.filter((l) => l.entry_date.startsWith(monthKey)));
  const monthExpenses = sum(expenses.filter((l) => l.entry_date.startsWith(monthKey)));

  const dunning: DunningCandidate[] = [];
  for (const inv of invoices) {
    if (!["open", "overdue"].includes(inv.status) || !inv.due_date) continue;
    const daysOverdue = Math.floor((nowMs - new Date(inv.due_date).getTime()) / 86_400_000);
    if (daysOverdue < DUNNING_DAYS[0]) continue;
    const stage = ([...DUNNING_DAYS].reverse().find((d) => daysOverdue >= d) ?? 3) as 3 | 7 | 10 | 14;
    dunning.push({
      invoice_ref: inv.external_id ?? inv.memo ?? inv.id.slice(0, 8),
      ledger_id: inv.id,
      amount: Number(inv.amount),
      counterparty: inv.counterparty,
      days_overdue: daysOverdue,
      stage,
    });
  }

  const opportunities = await store.list("opportunities", { where: { stage: "won" } });
  const byOffer = new Map<Offer, { won: number; total: number }>();
  for (const o of opportunities) {
    const g = byOffer.get(o.offer) ?? { won: 0, total: 0 };
    g.won += 1;
    g.total += Number(o.value_estimate ?? 0);
    byOffer.set(o.offer, g);
  }
  const unit_economics = [...byOffer.entries()].map(([offer, g]) => ({
    offer,
    won: g.won,
    total_value: round2(g.total),
    avg_value: round2(g.won ? g.total / g.won : 0),
  }));

  const projects = await store.list("projects");
  const budget_vs_actual = projects.map((p) => {
    const rows = ledger.filter((l) => l.project_id === p.id);
    return {
      project_id: p.id,
      invoiced: sum(rows.filter((l) => l.kind === "invoice")),
      collected: sum(rows.filter((l) => l.kind === "payment")),
      spent: sum(rows.filter((l) => l.kind === "expense")),
    };
  });

  // Runway: cash on hand / trailing monthly burn. Both degrade to env
  // fallbacks when the ledger is thin; null when neither exists.
  const trailingSpend = sum(expenses.filter((l) => within(l.entry_date, 90)));
  const monthlyBurn = trailingSpend > 0 ? trailingSpend / 3 : (cfg.STUDIO_MONTHLY_BURN ?? null);
  const cashOnHand = cfg.STUDIO_CASH_ON_HAND ?? null;
  const runway_months =
    cashOnHand != null && monthlyBurn != null && monthlyBurn > 0
      ? round1(cashOnHand / monthlyBurn)
      : null;

  return {
    as_of: iso.slice(0, 10),
    cash,
    pnl_month: { received: monthPayments, spent: monthExpenses, net: round2(monthPayments - monthExpenses) },
    dunning,
    unit_economics,
    budget_vs_actual,
    runway_months,
    policy: { dunning_days: [...DUNNING_DAYS], payment_split: "50/50" },
  };
}

function isOverdue(l: LedgerEntry, now: Date): boolean {
  return l.status === "open" && l.due_date != null && new Date(l.due_date).getTime() < now.getTime();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
