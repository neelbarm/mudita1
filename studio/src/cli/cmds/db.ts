import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import { cfg, dir, STUDIO_ROOT } from "../../os/config.js";

const CORE_SCHEMA = path.resolve(STUDIO_ROOT, "..", "sarga-haus", "supabase", "schema.sql");
const MIGRATION = path.join(STUDIO_ROOT, "db", "migrations", "001_studio.sql");
const SEED = path.join(STUDIO_ROOT, "db", "seed.sql");

export function registerDb(program: Command) {
  const db = program.command("db").description("Schema and store management.");

  db.command("print")
    .description("Print the studio migration (and optionally seed) for the Supabase SQL editor.")
    .option("--seed", "include seed data")
    .option("--all", "include the core sarga-haus schema first")
    .action((opts: { seed?: boolean; all?: boolean }) => {
      const parts: string[] = [];
      if (opts.all && existsSync(CORE_SCHEMA)) parts.push(readFileSync(CORE_SCHEMA, "utf8"));
      parts.push(readFileSync(MIGRATION, "utf8"));
      if (opts.seed) parts.push(readFileSync(SEED, "utf8"));
      console.log(parts.join("\n\n"));
    });

  db.command("push")
    .description("Apply the migration (and seed) directly via psql. Needs SUPABASE_DB_URL.")
    .option("--seed", "also apply seed data")
    .option("--all", "apply the core sarga-haus schema first")
    .action((opts: { seed?: boolean; all?: boolean }) => {
      if (!cfg.SUPABASE_DB_URL) {
        console.error(pc.red("SUPABASE_DB_URL is not set."));
        console.error(pc.dim("Copy it from Supabase > Settings > Database, or use `sarga db print` and paste into the SQL editor."));
        process.exitCode = 1;
        return;
      }
      const files = [
        ...(opts.all && existsSync(CORE_SCHEMA) ? [CORE_SCHEMA] : []),
        MIGRATION,
        ...(opts.seed ? [SEED] : []),
      ];
      for (const f of files) {
        console.log(pc.dim(`psql < ${path.basename(f)}`));
        execFileSync("psql", [cfg.SUPABASE_DB_URL, "-v", "ON_ERROR_STOP=1", "-f", f], { stdio: "inherit" });
      }
      console.log(pc.green("schema applied."));
    });

  db.command("reset-local")
    .description("Delete the local JSON store (.local/db.json). Supabase data is never touched.")
    .action(() => {
      const file = path.join(dir.local, "db.json");
      if (existsSync(file)) {
        rmSync(file);
        console.log(pc.green(`removed ${file}`));
      } else {
        console.log(pc.dim("no local store to remove."));
      }
    });
}
