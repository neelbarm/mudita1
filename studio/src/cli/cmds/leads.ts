import type { Command } from "commander";
import pc from "picocolors";
import { humanActor } from "../../os/config.js";
import { writeEvent } from "../../os/events.js";
import { getStore } from "../../os/store/index.js";
import { approveFact } from "../../leads/facts.js";
import { outreachReady } from "../../leads/readiness.js";
import { scoreIcp, type ScoreInput } from "../../leads/scoring.js";
import { enrollContact } from "../../leads/sequence/enroll.js";
import type { SignalType } from "../../os/store/types.js";

export function registerLeads(program: Command) {
  const accounts = program.command("accounts").description("Accounts: list, score, qualify.");

  accounts
    .command("list")
    .option("--status <status>", "filter by status")
    .action(async (opts: { status?: string }) => {
      const store = getStore();
      const rows = await store.list("accounts", opts.status ? { where: { status: opts.status } } : {});
      for (const a of rows) {
        console.log(
          `  ${pc.bold((a.name ?? "").slice(0, 32).padEnd(34))} ${String(a.icp_score ?? "-").padStart(3)}  ${pc.dim(a.status.padEnd(12))} ${pc.dim(a.domain ?? "")}  ${pc.dim(a.id.slice(0, 8))}`,
        );
      }
      if (rows.length === 0) console.log(pc.dim("  no accounts yet. sarga source csv <file> to begin."));
    });

  accounts
    .command("score <accountId>")
    .description("Score an account with the deterministic ICP rubric, or log an override.")
    .option("--fit <fit>", "segment fit: core | adjacent | none", "core")
    .option("--override <n>", "log a human override instead of computing")
    .option("--note <note>", "reason (required for overrides)")
    .action(async (accountId: string, opts: { fit: string; override?: string; note?: string }) => {
      const store = getStore();
      const account = await store.get("accounts", accountId);
      if (!account) throw new Error("account not found");

      if (opts.override != null) {
        if (!opts.note) throw new Error("overrides require --note; they are logged, not silent");
        const n = Number(opts.override);
        await store.update("accounts", accountId, {
          icp_score: n,
          status: n >= 60 && account.status === "research" ? "qualified" : account.status,
        });
        await writeEvent({
          entity: "account",
          entityId: accountId,
          actor: humanActor(),
          action: "icp.override",
          detail: { score: n, note: opts.note, was: account.icp_score },
        });
        if (n >= 60 && account.status === "research") {
          await writeEvent({ entity: "account", entityId: accountId, actor: humanActor(), action: "account.qualified", detail: { via: "override" } });
        }
        console.log(pc.green(`override logged: ${n} (${opts.note})`));
        return;
      }

      const signals = await store.list("signals", { where: { account_id: accountId } });
      const contacts = await store.list("contacts", { where: { account_id: accountId } });
      const best = contacts.find((c) => c.email_status === "verified") ?? contacts[0] ?? null;
      const freshest = signals
        .map((s) => (s.observed_at ? Math.floor((Date.now() - new Date(s.observed_at).getTime()) / 86_400_000) : null))
        .filter((d): d is number => d != null)
        .sort((a, b) => a - b)[0] ?? null;

      const input: ScoreInput = {
        segmentFit: (opts.fit as ScoreInput["segmentFit"]) ?? "core",
        signalTypes: signals.map((s) => s.type as SignalType),
        teamSize: null,
        revenueHint: null,
        emailStatus: best?.email_status ?? null,
        hasLinkedin: Boolean(best?.linkedin_url),
        freshestSignalDays: freshest,
      };
      const score = scoreIcp(input);
      await store.update("accounts", accountId, {
        icp_score: score.total,
        status: score.qualifies && account.status === "research" ? "qualified" : account.status,
      });
      await writeEvent({
        entity: "account",
        entityId: accountId,
        actor: humanActor(),
        action: score.qualifies ? "account.qualified" : "account.scored",
        detail: score as unknown as Record<string, unknown>,
      });
      console.log(
        `  segment ${score.segment_fit}  pain ${score.pain_evidence}  budget ${score.budget_plausibility}  reach ${score.reachability}  timing ${score.timing}`,
      );
      console.log(score.qualifies ? pc.green(`  total ${score.total}: qualified`) : pc.yellow(`  total ${score.total}: below 60`));
    });

  const facts = program.command("facts").description("Cited facts: the raw material outreach may use.");
  facts
    .command("list <accountId>")
    .action(async (accountId: string) => {
      const rows = await getStore().list("facts", { where: { account_id: accountId } });
      for (const f of rows) {
        const dot = f.status === "approved" ? pc.green("●") : f.status === "candidate" ? pc.yellow("○") : pc.red("×");
        console.log(`  ${dot} ${f.fact.slice(0, 76)}  ${pc.dim(f.id.slice(0, 8))}`);
        console.log(pc.dim(`      ${f.source_url}`));
      }
    });
  facts
    .command("approve <factId>")
    .action(async (factId: string) => {
      const f = await approveFact(factId, humanActor().slice("human:".length));
      console.log(pc.green(`approved: ${f.fact.slice(0, 70)}`));
    });

  program
    .command("ready <contactId>")
    .description("Explain a contact's outreach readiness (the five conditions).")
    .action(async (contactId: string) => {
      const r = await outreachReady(getStore(), contactId, { assumeSequence: true });
      if (r.ready) console.log(pc.green("ready: verified email, ICP >= 60, 3+ approved facts, no suppression."));
      else for (const reason of r.reasons) console.log(pc.yellow(`  not ready: ${reason}`));
    });

  program
    .command("enroll <contactId>")
    .description("Enroll a ready contact into the default sequence (guarded).")
    .option("--sequence <id>")
    .action(async (contactId: string, opts: { sequence?: string }) => {
      const e = await enrollContact(contactId, { sequenceId: opts.sequence });
      console.log(pc.green(`enrolled ${contactId.slice(0, 8)} in sequence ${e.sequence_id.slice(0, 8)}; first action ${e.next_action_at}`));
    });
}
