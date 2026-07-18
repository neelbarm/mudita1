import { readFileSync } from "node:fs";
import type { Command } from "commander";
import pc from "picocolors";
import { draftDesignSpec } from "../../factory/designer.js";
import { scaffoldClient } from "../../factory/scaffold.js";
import { buildSection } from "../../factory/build-loop.js";
import { generateLaunchChecklist } from "../../factory/launch-checklist.js";
import type { Json } from "../../os/store/types.js";

export function registerFactory(program: Command) {
  const factory = program.command("factory").description("The MVP build factory: brief -> design spec -> scaffold -> build loop -> launch. Human gates at every phase.");

  factory
    .command("spec <slug>")
    .description("Designer drafts the full design system + section specs from a brief and brand interview.")
    .option("--brief <file>", "project brief JSON")
    .option("--interview <file>", "brand interview JSON")
    .option("--dry-run")
    .action(async (slug: string, opts: { brief?: string; interview?: string; dryRun?: boolean }) => {
      const brief = opts.brief ? (JSON.parse(readFileSync(opts.brief, "utf8")) as Json) : {};
      const interview = opts.interview ? (JSON.parse(readFileSync(opts.interview, "utf8")) as Json) : {};
      const { approval } = await draftDesignSpec({ slug, brief, interview, dryRun: opts.dryRun, trigger: "cli" });
      if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
    });

  factory
    .command("scaffold <slug>")
    .description("Scaffold the client app from the template with an approved spec.")
    .option("--name <name>", "display name", "Client")
    .option("--spec <file>", "approved spec JSON (defaults to the approved design_spec payload artifact)")
    .option("--no-install", "skip npm install")
    .action(async (slug: string, opts: { name: string; spec?: string; install?: boolean }) => {
      const spec = opts.spec ? (JSON.parse(readFileSync(opts.spec, "utf8")) as Json) : {};
      const dirPath = await scaffoldClient({ slug, name: opts.name, spec, install: opts.install });
      console.log(pc.green(`scaffolded ${dirPath}`));
    });

  factory
    .command("build <slug>")
    .description("Build one section: implement, verify build, screenshot, critic, review gate.")
    .requiredOption("--section <id>", "section id from the spec")
    .option("--dry-run", "use the pre-baked demo section instead of the live Builder")
    .action(async (slug: string, opts: { section: string; dryRun?: boolean }) => {
      const { approval, screenshots } = await buildSection({ slug, section: opts.section, dryRun: opts.dryRun, trigger: "cli" });
      console.log(pc.green(`${screenshots.length} screenshots taken.`));
      console.log(pc.yellow(`queued: ${approval.title}`));
    });

  factory
    .command("checklist <slug>")
    .description("Generate LAUNCH.md from the build's real state and queue the go decision.")
    .action(async (slug: string) => {
      const approval = await generateLaunchChecklist(slug);
      console.log(pc.yellow(`queued: ${approval.title}`));
    });
}
