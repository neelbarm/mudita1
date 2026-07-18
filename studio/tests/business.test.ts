import { describe, expect, it } from "vitest";
import "../src/effects.js";
import { freshStore } from "./helpers.js";
import { computeFinance } from "../src/finance/compute.js";
import { dunningTick } from "../src/finance/dunning.js";
import { runAgent } from "../src/agents/runner.js";
import { decide } from "../src/os/approvals.js";

function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

describe("finance compute (code computes, agents narrate)", () => {
  it("computes cash, pnl, dunning stages, and unit economics", async () => {
    const store = freshStore();
    await store.insert("ledger_entries", { entry_date: daysAgo(5), kind: "payment", amount: 7000, status: "paid" });
    await store.insert("ledger_entries", { entry_date: daysAgo(10), kind: "expense", amount: 1200, status: "paid" });
    await store.insert("ledger_entries", { entry_date: daysAgo(20), kind: "invoice", amount: 7000, due_date: daysAgo(8), status: "open", memo: "HB-002" });
    await store.insert("ledger_entries", { entry_date: daysAgo(40), kind: "invoice", amount: 3000, due_date: daysAgo(16), status: "open", memo: "NL-001" });
    await store.insert("opportunities", { offer: "build", stage: "won", value_estimate: 14000 });

    const f = await computeFinance(store);
    expect(f.cash.received_30d).toBe(7000);
    expect(f.cash.spent_30d).toBe(1200);
    // both invoices count as overdue exposure (open past due)
    expect(f.cash.overdue_invoices).toBe(10000);
    expect(f.dunning).toHaveLength(2);
    const hb = f.dunning.find((d) => d.invoice_ref === "HB-002")!;
    expect(hb.stage).toBe(7);
    const nl = f.dunning.find((d) => d.invoice_ref === "NL-001")!;
    expect(nl.stage).toBe(14);
    expect(f.unit_economics[0]).toMatchObject({ offer: "build", won: 1, avg_value: 14000 });
    expect(f.policy.dunning_days).toEqual([3, 7, 10, 14]);
  });

  it("dunning tick drafts reminders for 3/7 and flags 10/14, idempotently", async () => {
    const store = freshStore();
    await store.insert("ledger_entries", { entry_date: daysAgo(20), kind: "invoice", amount: 7000, due_date: daysAgo(4), status: "open", memo: "A-1" });
    await store.insert("ledger_entries", { entry_date: daysAgo(30), kind: "invoice", amount: 2000, due_date: daysAgo(11), status: "open", memo: "B-2" });
    await store.insert("ledger_entries", { entry_date: daysAgo(40), kind: "invoice", amount: 9000, due_date: daysAgo(15), status: "open", memo: "C-3" });

    const first = await dunningTick();
    expect(first.reminders).toBe(1); // A-1 at stage 3
    expect(first.calls).toBe(1); // B-2 at stage 10
    expect(first.pauses).toBe(1); // C-3 at stage 14

    const second = await dunningTick();
    expect(second).toEqual({ reminders: 0, calls: 0, pauses: 0 });

    const approvals = await store.list("approvals", { where: { kind: "invoice_reminder" } });
    expect(approvals).toHaveLength(1);
    expect(approvals[0]!.title.startsWith("[draft]")).toBe(true);
  });
});

describe("equity cooling-off (48h, code-enforced)", () => {
  it("refuses approval inside the window", async () => {
    freshStore();
    const { approval, output } = await runAgent(
      "legal-drafter",
      { doc_type: "equity_memo" },
      { trigger: "sim", mode: "dry_run", fixture: "equity" },
    );
    expect(output.doc_type).toBe("equity_memo");
    expect(typeof output.cooling_off_until).toBe("string");
    await expect(decide(approval!.id, { decision: "approved", decidedBy: "neel" })).rejects.toThrow(
      /cooling-off/,
    );
    // rejection is always allowed
    const rejected = await decide(approval!.id, { decision: "rejected", decidedBy: "neel", note: "slept on it, no" });
    expect(rejected.status).toBe("rejected");
  });
});
