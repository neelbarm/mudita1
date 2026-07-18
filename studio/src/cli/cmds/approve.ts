import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import * as clack from "@clack/prompts";
import type { Command } from "commander";
import pc from "picocolors";
import { cfg } from "../../os/config.js";
import { decide, listPending } from "../../os/approvals.js";
import { getStore } from "../../os/store/index.js";
import type { Json } from "../../os/store/types.js";

/**
 * The approval queue TUI: the founder's daily two minutes. Approve,
 * edit then approve, reject with a note, or skip. Every decision is a
 * named human decision; effectors fire only on approve.
 */

function renderPayload(kind: string, payload: Json): string {
  if (kind === "outreach_message" || kind === "invoice_reminder") {
    const subject = payload.subject ? `Subject: ${payload.subject}\n` : "";
    return `${subject}\n${payload.body ?? ""}`;
  }
  for (const k of ["body_markdown", "narrative", "tldr"]) {
    if (typeof payload[k] === "string") return payload[k] as string;
  }
  return JSON.stringify(payload, null, 2);
}

function editInEditor(payload: Json): Json | null {
  const editor = process.env.EDITOR ?? "nano";
  const file = path.join(mkdtempSync(path.join(tmpdir(), "sarga-edit-")), "payload.json");
  writeFileSync(file, JSON.stringify(payload, null, 2));
  const res = spawnSync(editor, [file], { stdio: "inherit" });
  if (res.status !== 0) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Json;
  } catch {
    clack.log.error("edited payload is not valid JSON; keeping the original");
    return null;
  }
}

export function registerApprove(program: Command) {
  program
    .command("approve [id]")
    .description("Review the approval queue. Everything is a draft until you clear it here.")
    .option("--list", "print the queue and exit")
    .option("--json", "with --list: machine-readable")
    .option("--approve", "with an id: approve non-interactively")
    .option("--reject", "with an id: reject non-interactively")
    .option("--note <note>", "decision note")
    .option("--as <name>", "decide as this named human", cfg.operator)
    .action(async (id: string | undefined, opts: {
      list?: boolean; json?: boolean; approve?: boolean; reject?: boolean; note?: string; as: string;
    }) => {
      if (opts.list) {
        const rows = await listPending();
        if (opts.json) return void console.log(JSON.stringify(rows, null, 2));
        if (rows.length === 0) return void console.log(pc.dim("queue is empty."));
        for (const r of rows) {
          console.log(`  ${pc.yellow(String(r.kind).padEnd(18))} ${r.title}  ${pc.dim(`${r.age_hours}h  ${String(r.id).slice(0, 8)}`)}`);
        }
        return;
      }

      if (id && (opts.approve || opts.reject)) {
        const updated = await decide(id, {
          decision: opts.approve ? "approved" : "rejected",
          decidedBy: opts.as,
          note: opts.note,
        });
        console.log(pc.green(`${updated.status}: ${updated.title}`));
        return;
      }

      // Interactive queue walk.
      const store = getStore();
      const rows = await listPending();
      if (rows.length === 0) {
        console.log(pc.dim("queue is empty. Nothing is waiting on you."));
        return;
      }
      clack.intro(pc.bold(`approval queue: ${rows.length} draft${rows.length === 1 ? "" : "s"}`));
      for (const row of rows) {
        const approval = await store.get("approvals", String(row.id));
        if (!approval || approval.status !== "pending") continue;
        console.log();
        console.log(pc.yellow(`  ${approval.kind}`) + pc.dim(`  drafted by ${row.drafted_by ?? "unknown"}`));
        console.log(pc.bold(`  ${approval.title}`));
        console.log();
        console.log(
          renderPayload(approval.kind, approval.payload)
            .split("\n")
            .map((l) => `    ${l}`)
            .join("\n"),
        );
        console.log();
        const action = await clack.select({
          message: "decision",
          options: [
            { value: "approve", label: "approve" },
            { value: "edit", label: "edit in $EDITOR, then approve" },
            { value: "reject", label: "reject with a note" },
            { value: "skip", label: "skip for now" },
            { value: "quit", label: "quit" },
          ],
        });
        if (clack.isCancel(action) || action === "quit") break;
        if (action === "skip") continue;
        if (action === "approve") {
          await decide(approval.id, { decision: "approved", decidedBy: opts.as });
          clack.log.success(`approved as ${opts.as}`);
        } else if (action === "edit") {
          const edited = editInEditor(approval.payload);
          await decide(approval.id, {
            decision: "approved",
            decidedBy: opts.as,
            editedPayload: edited ?? undefined,
            note: edited ? "edited before approval" : undefined,
          });
          clack.log.success(`approved (edited) as ${opts.as}`);
        } else if (action === "reject") {
          const note = await clack.text({ message: "why? (recorded)" });
          if (clack.isCancel(note)) continue;
          await decide(approval.id, { decision: "rejected", decidedBy: opts.as, note: String(note) });
          clack.log.info("rejected");
        }
      }
      clack.outro("queue walk done.");
    });
}
