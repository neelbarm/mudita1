import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import pc from "picocolors";
import "../effects.js";
import { dir } from "../os/config.js";
import { decide } from "../os/approvals.js";
import { LocalStore } from "../os/store/local.js";
import { setStore } from "../os/store/index.js";
import { draftDesignSpec } from "../factory/designer.js";
import { scaffoldClient } from "../factory/scaffold.js";
import { buildSection } from "../factory/build-loop.js";
import { generateLaunchChecklist } from "../factory/launch-checklist.js";
import type { Json } from "../os/store/types.js";

/**
 * sim:factory — the MVP factory end to end with zero keys:
 * brief -> Designer spec (fixture) -> human gate -> REAL scaffold ->
 * REAL npm install -> demo section applied -> REAL production build ->
 * REAL server + screenshots -> critic (fixture) -> review gate ->
 * launch checklist gate. The only canned parts are the two agent
 * voices; every build artifact is real.
 *
 * Pass --keep to keep node_modules for iteration; default cleans it.
 */

const SLUG = "demo-harbor";
let step = 0;
function beat(msg: string) {
  step += 1;
  console.log(pc.yellow(`\n${String(step).padStart(2, "0")}`), pc.bold(msg));
}
function ok(msg: string) {
  console.log(pc.green("   ok"), msg);
}
function expect(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    console.error(pc.red(`   FAIL ${msg}`));
    process.exit(1);
  }
}

async function main() {
  const keep = process.argv.includes("--keep");
  const dbFile = path.join(dir.local, "sim-factory.json");
  if (existsSync(dbFile)) rmSync(dbFile);
  const store = new LocalStore(dbFile);
  setStore(store);

  const clientDir = path.join(dir.clients, SLUG);
  if (existsSync(clientDir)) {
    rmSync(clientDir, { recursive: true, force: true });
  }

  beat("the brief arrives (from the won proposal)");
  const briefFile = JSON.parse(readFileSync(path.join(dir.fixtures, "factory", "demo-brief.json"), "utf8")) as Json;
  ok(`objective: ${String(briefFile.objective).slice(0, 70)}...`);

  beat("designer drafts the full design system + section specs");
  const { approval: specApproval } = await draftDesignSpec({
    slug: SLUG,
    brief: briefFile,
    interview: (briefFile.interview ?? {}) as Json,
    trigger: "sim",
    dryRun: true,
  });
  expect(specApproval, "design spec queued");
  expect(specApproval!.title.startsWith("[draft]"), "spec is a draft until a human clears it");
  ok(specApproval!.summary ?? specApproval!.title);

  beat("human gate: approve the design spec");
  const decided = await decide(specApproval!.id, { decision: "approved", decidedBy: "neel" });
  const spec = decided.payload as Json;
  const specs = await store.list("design_specs");
  expect(specs[0]?.status === "approved", "design_specs row marked approved");
  ok("approved; tokens and sections are now law");

  beat("scaffold the client app (real template, real install, real git)");
  await scaffoldClient({ slug: SLUG, name: "Harbor Pilates", spec });
  expect(existsSync(path.join(clientDir, "package.json")), "package.json in place");
  expect(existsSync(path.join(clientDir, ".git")), "git repository initialized");
  const tokens = readFileSync(path.join(clientDir, "src", "design", "tokens.css"), "utf8");
  expect(tokens.includes("#f5f1ea") && tokens.includes("#b4653f"), "tokens.css carries the approved palette");
  ok("clients/demo-harbor scaffolded with the approved design system");

  beat("build the hero section (real build, real screenshots, critic scores)");
  const { approval: buildApproval, screenshots } = await buildSection({
    slug: SLUG,
    section: "hero",
    trigger: "sim",
    dryRun: true,
  });
  expect(screenshots.length === 2, "desktop + phone screenshots");
  for (const s of screenshots) expect(existsSync(s), `screenshot exists: ${s}`);
  expect(buildApproval.title.includes("pass"), "critic verdict recorded in the gate title");
  ok(`production build passed; ${screenshots.length} screenshots; critic: pass`);

  beat("human gate: approve the build review");
  await decide(buildApproval.id, { decision: "approved", decidedBy: "neel" });
  const runs = await store.list("build_runs", { where: { project_slug: SLUG, phase: "build" } });
  expect(runs[0]?.status === "approved", "build run approved");
  ok("hero approved");

  beat("launch checklist generated from the build's real state");
  const checklistApproval = await generateLaunchChecklist(SLUG);
  expect(existsSync(path.join(clientDir, "LAUNCH.md")), "LAUNCH.md written");
  await decide(checklistApproval.id, { decision: "approved", decidedBy: "neel" });
  ok("go decision recorded; the deploy stays in human hands");

  const events = await store.count("events");
  console.log(
    pc.green(
      `\nfactory sim complete: ${step} beats, ${events} events. ` +
        `Open clients/${SLUG}/qa/screens/ to see what the machine built.\n`,
    ),
  );

  if (!keep) {
    rmSync(path.join(clientDir, "node_modules"), { recursive: true, force: true });
    rmSync(path.join(clientDir, ".next"), { recursive: true, force: true });
    console.log(pc.dim("cleaned node_modules and .next (pass --keep to keep them)."));
  }
}

main().catch((err) => {
  console.error(pc.red("factory sim failed:"), err);
  process.exit(1);
});
