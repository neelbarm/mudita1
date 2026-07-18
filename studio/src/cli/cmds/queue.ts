import { readFileSync } from "node:fs";
import type { Command } from "commander";
import pc from "picocolors";
import { dueEnrollments } from "../../leads/sequence/queue.js";
import { advanceEnrollment } from "../../leads/sequence/advance.js";
import { ingestReply } from "../../leads/sequence/replies.js";
import { draftWeeklyReport } from "../../leads/report.js";
import { getStore } from "../../os/store/index.js";

export function registerQueue(program: Command) {
  program
    .command("queue")
    .description("The daily queue: due enrollments by next_action_at. Nothing relies on memory.")
    .option("--advance", "draft the due touches (each lands in the approval queue)")
    .option("--dry-run", "force fixture drafting")
    .action(async (opts: { advance?: boolean; dryRun?: boolean }) => {
      const due = await dueEnrollments();
      if (due.length === 0) {
        console.log(pc.dim("nothing due. The queue is honest; enjoy it."));
        return;
      }
      const store = getStore();
      for (const e of due) {
        const contact = await store.get("contacts", e.contact_id);
        console.log(`  ${pc.bold(contact?.full_name ?? e.contact_id.slice(0, 8))}  step ${e.current_step}  due ${pc.dim(e.next_action_at ?? "")}`);
        if (opts.advance) {
          const approval = await advanceEnrollment(e, { trigger: "cli", dryRun: opts.dryRun });
          if (approval) console.log(pc.yellow(`    drafted -> ${approval.title}`));
        }
      }
      if (!opts.advance) console.log(pc.dim("\n  draft them: sarga queue --advance, then sarga approve"));
    });

  program
    .command("reply")
    .description("Ingest an inbound reply (from a file or flags) for classification.")
    .option("--from <email>", "sender address")
    .option("--subject <subject>")
    .option("--body <body>")
    .option("--file <json>", "JSON file with {from, subject, body}")
    .action(async (opts: { from?: string; subject?: string; body?: string; file?: string }) => {
      const mail = opts.file
        ? (JSON.parse(readFileSync(opts.file, "utf8")) as { from: string; subject?: string; body: string })
        : { from: opts.from ?? "", subject: opts.subject, body: opts.body ?? "" };
      if (!mail.from || !mail.body) throw new Error("need --from and --body (or --file)");
      const res = await ingestReply(mail);
      if (!res) {
        console.log(pc.yellow("no matching contact/enrollment; logged for a human."));
        return;
      }
      console.log(pc.green(`reply recorded; suggested class queued for confirmation: ${res.approval.title}`));
    });

  program
    .command("report")
    .description("Draft the weekly report from computed metrics.")
    .option("--shipped <items...>", "shipped items to include")
    .option("--dry-run")
    .action(async (opts: { shipped?: string[]; dryRun?: boolean }) => {
      const approval = await draftWeeklyReport({ shipped: opts.shipped, dryRun: opts.dryRun, trigger: "cli" });
      if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
    });
}
