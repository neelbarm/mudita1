import { readFileSync } from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import { dir, humanActor } from "../../os/config.js";
import { writeEvent } from "../../os/events.js";
import { getStore } from "../../os/store/index.js";
import { runAgent } from "../../agents/runner.js";
import { importLedgerCsv } from "../../finance/ledger.js";
import { computeFinance } from "../../finance/compute.js";
import { draftFinanceDigest } from "../../finance/digest.js";
import { dunningTick } from "../../finance/dunning.js";
import { syncStripeInvoices } from "../../finance/stripe.js";
import { draftStrategyMemo } from "../../strategy/gather.js";
import type { Json } from "../../os/store/types.js";

export function registerBusiness(program: Command) {
  const finance = program.command("finance").description("Money: ledger, digest, dunning. Code computes; agents narrate.");

  finance
    .command("import <csv>")
    .description("Import ledger rows from CSV (idempotent). Headers: date, kind, amount, currency, counterparty, memo, due_date, status")
    .action(async (csv: string) => {
      const { added, skipped } = await importLedgerCsv(csv);
      console.log(pc.green(`${added} entries added, ${skipped} skipped.`));
    });

  finance
    .command("view")
    .description("Print the computed finance picture (no agent involved).")
    .action(async () => {
      const f = await computeFinance(getStore());
      console.log(JSON.stringify(f, null, 2));
    });

  finance
    .command("digest")
    .description("Draft the finance digest into the queue.")
    .option("--dry-run")
    .action(async (opts: { dryRun?: boolean }) => {
      const approval = await draftFinanceDigest({ dryRun: opts.dryRun, trigger: "cli" });
      if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
    });

  finance
    .command("dunning")
    .description("Run the dunning tick: day 3/7 reminders drafted, day 10 call flag, day 14 pause flag.")
    .action(async () => {
      const r = await dunningTick();
      console.log(pc.green(`${r.reminders} reminders drafted, ${r.calls} call flags, ${r.pauses} pause flags.`));
    });

  finance
    .command("stripe-sync")
    .description("Mirror Stripe invoices into the ledger (needs STRIPE_API_KEY).")
    .action(async () => {
      const { synced } = await syncStripeInvoices();
      console.log(pc.green(`${synced} invoices mirrored.`));
    });

  program
    .command("strategy")
    .description("Draft the weekly partner memo (pipeline + metrics + stalled + finance).")
    .option("--dry-run")
    .action(async (opts: { dryRun?: boolean }) => {
      const approval = await draftStrategyMemo({ dryRun: opts.dryRun, trigger: "cli" });
      if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
    });

  program
    .command("legal <docType>")
    .description("Draft a legal document (msa, sow, privacy_policy, tos, dpa_checklist, equity_memo, contract_review). Always stamped for attorney review.")
    .option("--input <file>", "deal facts JSON")
    .option("--dry-run")
    .action(async (docType: string, opts: { input?: string; dryRun?: boolean }) => {
      const deal = opts.input ? (JSON.parse(readFileSync(opts.input, "utf8")) as Json) : {};
      const templatePath = path.join(dir.templates, "legal", `${docType.replace(/_/g, "-")}.md`);
      let template = "";
      try {
        template = readFileSync(templatePath, "utf8");
      } catch {
        /* the agent works from its knowledge of the doc type */
      }
      const { approval } = await runAgent(
        "legal-drafter",
        { doc_type: docType, deal, template },
        { trigger: "cli", mode: opts.dryRun ? "dry_run" : undefined },
      );
      if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
      if (docType === "equity_memo") console.log(pc.dim("equity memos carry a 48h cooling-off before they can be approved."));
    });

  program
    .command("project")
    .description("Projects. Creation is gated: no work before signature and deposit.")
    .command("new <opportunityId>")
    .option("--contract-signed", "the contract is signed")
    .option("--deposit-paid", "the deposit landed")
    .option("--offer <offer>", "validation | build | automation | pipeline | growth")
    .action(async (opportunityId: string, opts: { contractSigned?: boolean; depositPaid?: boolean; offer?: string }) => {
      if (!opts.contractSigned || !opts.depositPaid) {
        console.error(pc.red("refused: no work before signature AND deposit (docs/06 §8)."));
        console.error(pc.dim("pass --contract-signed --deposit-paid when both are true."));
        process.exitCode = 1;
        return;
      }
      const store = getStore();
      const opp = await store.get("opportunities", opportunityId);
      if (!opp) throw new Error("opportunity not found");
      const project = await store.insert("projects", {
        opportunity_id: opportunityId,
        offer: opts.offer ?? opp.offer,
        state: "onboarding",
        start_date: new Date().toISOString().slice(0, 10),
      });
      await writeEvent({
        entity: "project",
        entityId: project.id,
        actor: humanActor(),
        action: "project.created",
        detail: { contract_signed: true, deposit_paid: true },
      });
      console.log(pc.green(`project ${project.id.slice(0, 8)} created in onboarding.`));
      console.log(pc.dim("next: sarga agent run brief-preparer, onboarding checklist within 24h (docs/06 §10)."));
    });
}
