import type { Command } from "commander";
import pc from "picocolors";
import { capabilities } from "../../os/capabilities.js";
import { cfg } from "../../os/config.js";

export function registerDoctor(program: Command) {
  program
    .command("doctor")
    .description("Show the capability matrix: what runs live, what runs degraded, and which key unlocks each row.")
    .option("--json", "machine-readable output")
    .action((opts: { json?: boolean }) => {
      const rows = capabilities();
      if (opts.json) {
        console.log(JSON.stringify({ operator: cfg.operator, capabilities: rows }, null, 2));
        return;
      }
      console.log();
      console.log(pc.bold("  Sarga Studio OS") + pc.dim(`  operator: ${cfg.operator}`));
      console.log(pc.dim("  " + "-".repeat(72)));
      for (const r of rows) {
        const dot = r.live ? pc.green("●") : pc.yellow("○");
        const key = r.key.padEnd(12);
        const mode = r.live ? pc.white(r.mode) : pc.dim(r.mode);
        const unlock = r.unlock ? pc.dim(`  unlock: ${r.unlock}`) : "";
        console.log(`  ${dot} ${key} ${mode}${unlock}`);
        if (r.note) console.log(pc.dim(`      ${r.note}`));
      }
      console.log(pc.dim("  " + "-".repeat(72)));
      const degraded = rows.filter((r) => !r.live).length;
      console.log(
        degraded === 0
          ? pc.green("  fully live.")
          : pc.dim(`  ${degraded} capabilit${degraded === 1 ? "y" : "ies"} degraded. The studio still runs: every path has a key-free mode.`),
      );
      console.log();
    });
}
