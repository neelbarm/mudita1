import { createApproval } from "../os/approvals.js";
import { humanActor } from "../os/config.js";
import { writeEvent } from "../os/events.js";
import { notify } from "../os/notify.js";
import { getStore } from "../os/store/index.js";
import { computeFinance } from "./compute.js";

/**
 * The dunning tick (docs/06 §9): day 3 and 7 draft reminders into the
 * queue (a human approves and sends), day 10 flags a human call, day
 * 14 flags a work pause. Nothing here sends or pauses anything itself.
 */
export async function dunningTick(): Promise<{ reminders: number; calls: number; pauses: number }> {
  const store = getStore();
  const { dunning } = await computeFinance(store);
  let reminders = 0;
  let calls = 0;
  let pauses = 0;

  const pending = await store.list("approvals", {
    where: { kind: "invoice_reminder", status: ["pending", "approved"] },
  });
  const events = await store.list("events", { where: { entity: "ledger" } });

  for (const d of dunning) {
    if (d.stage === 3 || d.stage === 7) {
      const already = pending.some(
        (a) => a.payload.invoice_ref === d.invoice_ref && a.payload.stage === d.stage,
      );
      if (already) continue;
      const firm = d.stage === 7;
      await createApproval({
        kind: "invoice_reminder",
        title: `Invoice reminder (day ${d.stage}): ${d.invoice_ref} ${d.amount}`,
        summary: `${d.counterparty ?? "client"} is ${d.days_overdue} days overdue`,
        payload: {
          invoice_ref: d.invoice_ref,
          stage: d.stage,
          days_overdue: d.days_overdue,
          escalation: firm ? "firm" : "gentle",
          subject: firm ? `Invoice ${d.invoice_ref}: second reminder` : `Invoice ${d.invoice_ref}: friendly reminder`,
          body: firm
            ? `Hi,\n\nFollowing up on invoice ${d.invoice_ref}, now ${d.days_overdue} days past due. Could you let me know when payment will land? If something is blocking it on your side, tell me and we will sort it together.\n\nThanks,\nNeel`
            : `Hi,\n\nA quick note that invoice ${d.invoice_ref} came due ${d.days_overdue} days ago. No drama; these things slip. The payment link is on the invoice.\n\nThanks,\nNeel`,
        },
        entity: "ledger",
        entityId: d.ledger_id,
      });
      reminders += 1;
    } else if (d.stage === 10) {
      const flagged = events.some(
        (e) => e.entity_id === d.ledger_id && e.action === "dunning.call_needed",
      );
      if (!flagged) {
        await writeEvent({
          entity: "ledger",
          entityId: d.ledger_id,
          actor: humanActor(),
          action: "dunning.call_needed",
          detail: { invoice_ref: d.invoice_ref, days_overdue: d.days_overdue },
        });
        await notify(`dunning: ${d.invoice_ref} is ${d.days_overdue} days overdue. Day 10 rule: pick up the phone.`);
        calls += 1;
      }
    } else if (d.stage === 14) {
      const flagged = events.some(
        (e) => e.entity_id === d.ledger_id && e.action === "dunning.pause_work",
      );
      if (!flagged) {
        await writeEvent({
          entity: "ledger",
          entityId: d.ledger_id,
          actor: humanActor(),
          action: "dunning.pause_work",
          detail: { invoice_ref: d.invoice_ref, days_overdue: d.days_overdue },
        });
        await notify(`dunning: ${d.invoice_ref} hit day 14. Policy says pause work until payment. Your call to make, today.`);
        pauses += 1;
      }
    }
  }
  return { reminders, calls, pauses };
}
