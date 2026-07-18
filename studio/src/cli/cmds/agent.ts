import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import { dir } from "../../os/config.js";
import { listAgents } from "../../agents/registry.js";
import { runAgent } from "../../agents/runner.js";
import type { Json } from "../../os/store/types.js";

function readInput(inputPath?: string, slug?: string): Json {
  if (inputPath) {
    return JSON.parse(readFileSync(inputPath, "utf8")) as Json;
  }
  // Convenience: fall back to the fixture's own representative input.
  if (slug) {
    const fx = path.join(dir.fixtures, "agents", slug, "default.json");
    if (existsSync(fx)) {
      const parsed = JSON.parse(readFileSync(fx, "utf8")) as { input?: Json };
      if (parsed.input) return parsed.input;
    }
  }
  return {};
}

export function registerAgent(program: Command) {
  const agent = program.command("agent").description("Run and inspect the 17 studio agents.");

  agent
    .command("list")
    .description("List every agent, its job, and its approval gate.")
    .action(() => {
      console.log();
      for (const a of listAgents()) {
        console.log(`  ${pc.bold(a.slug.padEnd(22))} ${pc.dim(a.approvalKind ?? "no gate")}`);
        console.log(`  ${" ".repeat(22)} ${a.job}`);
      }
      console.log();
      console.log(pc.dim("  run one: sarga agent run <slug> [--input file.json] [--dry-run]"));
      console.log();
    });

  agent
    .command("run <slug>")
    .description("Run an agent. Output lands in the approval queue as a draft.")
    .option("--input <file>", "JSON input file (defaults to the agent's fixture input)")
    .option("--dry-run", "force fixture mode even when ANTHROPIC_API_KEY is set")
    .option("--fixture <name>", "fixture variant for dry runs", "default")
    .option("--entity-id <id>", "entity id to attach the run to")
    .action(async (slug: string, opts: { input?: string; dryRun?: boolean; fixture?: string; entityId?: string }) => {
      const input = readInput(opts.input, slug);
      const { run, approval } = await runAgent(slug, input, {
        trigger: "cli",
        mode: opts.dryRun ? "dry_run" : undefined,
        fixture: opts.fixture,
        entityId: opts.entityId,
      });
      console.log();
      console.log(`  run      ${run.id}`);
      console.log(`  mode     ${run.mode}  model ${run.model ?? "n/a"}  cost ${run.cost_usd ?? 0}`);
      if (approval) {
        console.log(`  queued   ${pc.yellow(approval.title)}`);
        console.log(pc.dim(`  decide:  sarga approve`));
      }
      console.log();
    });

  // Aliases: sarga agent:<slug>
  for (const a of listAgents()) {
    program
      .command(`agent:${a.slug}`, { hidden: true })
      .description(a.job)
      .option("--input <file>")
      .option("--dry-run")
      .action(async (opts: { input?: string; dryRun?: boolean }) => {
        const input = readInput(opts.input, a.slug);
        const { approval } = await runAgent(a.slug, input, {
          trigger: "cli",
          mode: opts.dryRun ? "dry_run" : undefined,
        });
        if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
      });
  }
}
