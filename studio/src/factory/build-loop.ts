import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { cfg, dir } from "../os/config.js";
import { log } from "../os/log.js";
import { getStore } from "../os/store/index.js";
import { createApproval } from "../os/approvals.js";
import { runAgent } from "../agents/runner.js";
import type { Approval, Json } from "../os/store/types.js";
import { critiqueScreens } from "./designer.js";

const pExecFile = promisify(execFile);

/**
 * The build loop: implement one section, prove it builds, screenshot
 * it, let the Designer-critic score it, iterate up to three times,
 * then land the evidence in the review gate. Dry-run swaps the
 * Builder for pre-baked demo sections but keeps the REAL build, the
 * REAL server, and the REAL screenshots.
 */

export async function runBuildCmd(clientDir: string): Promise<{ ok: boolean; output: string }> {
  try {
    const { stdout, stderr } = await pExecFile("npm", ["run", "build"], {
      cwd: clientDir,
      timeout: 300_000,
      maxBuffer: 16 * 1024 * 1024,
    });
    return { ok: true, output: stdout + stderr };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message: string };
    return { ok: false, output: `${e.stdout ?? ""}${e.stderr ?? ""}${e.message}` };
  }
}

function findChrome(): string | null {
  const roots = [cfg.playwrightBrowsersPath];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root)) {
      if (entry.startsWith("chromium")) {
        const bin = path.join(root, entry, "chrome-linux", "chrome");
        if (existsSync(bin)) return bin;
      }
    }
  }
  return null;
}

export async function screenshotClient(
  clientDir: string,
  routes: string[] = ["/"],
): Promise<string[]> {
  const port = 4321;
  const server = spawn("npm", ["run", "start"], { cwd: clientDir, stdio: "ignore", detached: true });
  const kill = () => {
    try {
      process.kill(-server.pid!, "SIGKILL");
    } catch {
      try {
        server.kill("SIGKILL");
      } catch {
        /* gone */
      }
    }
  };

  try {
    // Wait for the server.
    const deadline = Date.now() + 45_000;
    let up = false;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`http://localhost:${port}/`);
        if (res.ok) {
          up = true;
          break;
        }
      } catch {
        /* not yet */
      }
      await new Promise((r) => setTimeout(r, 700));
    }
    if (!up) throw new Error("client server did not come up on :4321");

    const { chromium } = await import("playwright");
    const executablePath = findChrome() ?? undefined;
    const browser = await chromium.launch({ executablePath });
    const shots: string[] = [];
    const screensDir = path.join(clientDir, "qa", "screens");
    mkdirSync(screensDir, { recursive: true });
    for (const route of routes) {
      for (const vp of [
        { name: "desktop", width: 1440, height: 900 },
        { name: "phone", width: 390, height: 844 },
      ]) {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`http://localhost:${port}${route}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(600);
        const slug = route === "/" ? "home" : route.replace(/\//g, "_");
        const file = path.join(screensDir, `${slug}-${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        shots.push(file);
        await page.close();
      }
    }
    await browser.close();
    return shots;
  } finally {
    kill();
  }
}

export async function buildSection(opts: {
  slug: string;
  section: string;
  trigger?: "cli" | "server" | "n8n" | "sim";
  dryRun?: boolean;
}): Promise<{ approval: Approval; screenshots: string[] }> {
  const store = getStore();
  const clientDir = path.join(dir.clients, opts.slug);
  if (!existsSync(path.join(clientDir, "package.json"))) {
    throw new Error(`clients/${opts.slug} is not scaffolded`);
  }
  const spec = JSON.parse(readFileSync(path.join(clientDir, "src", "design", "spec.json"), "utf8")) as Json;
  const sectionSpec = ((spec.sections as Array<Json>) ?? []).find((s) => s.id === opts.section);

  const run = await store.insert("build_runs", {
    project_slug: opts.slug,
    phase: "build",
    section: opts.section,
    status: "running",
  });

  let filesTouched: string[] = [];
  let buildOutput = "";
  const maxIterations = opts.dryRun ? 1 : 3;

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    if (opts.dryRun) {
      // Pre-baked demo section: real files, real build, canned author.
      const demo = path.join(dir.fixtures, "factory", "demo-sections", opts.section);
      if (!existsSync(demo)) throw new Error(`no demo section fixture for "${opts.section}"`);
      cpSync(demo, clientDir, { recursive: true });
      filesTouched = listFiles(demo);
      log.info(`dry-run: applied demo section "${opts.section}"`);
    } else {
      const { output } = await runAgent(
        "builder",
        {
          section: opts.section,
          section_spec: sectionSpec ?? null,
          iteration,
          previous_build_errors: iteration > 1 ? buildOutput.slice(-4000) : null,
        },
        {
          trigger: opts.trigger ?? "cli",
          cwd: clientDir,
          entityId: run.id,
          skipApproval: true,
        },
      );
      filesTouched = (output.files_touched as string[]) ?? [];
    }

    const build = await runBuildCmd(clientDir);
    buildOutput = build.output;
    if (build.ok) break;
    if (iteration === maxIterations) {
      await store.update("build_runs", run.id, { status: "failed", critique: { build_error: buildOutput.slice(-2000) } });
      throw new Error(`section "${opts.section}" failed to build after ${maxIterations} attempt(s)`);
    }
    log.warn(`build failed (iteration ${iteration}); feeding errors back to the Builder`);
  }

  const screenshots = await screenshotClient(clientDir);
  const critique = await critiqueScreens({
    slug: opts.slug,
    section: opts.section,
    screenshotPaths: screenshots,
    spec,
    trigger: opts.trigger,
    dryRun: opts.dryRun,
  });

  await store.update("build_runs", run.id, {
    status: "passed",
    screenshot_paths: screenshots,
    critique,
    scores: (critique.scores ?? {}) as Json,
  });

  const approval = await createApproval({
    kind: "build_review",
    title: `Build review: ${opts.slug} / ${opts.section} (critic ${String(critique.average)}, ${String(critique.verdict)})`,
    summary: ((critique.notes as string[]) ?? []).slice(0, 2).join(" · "),
    payload: {
      slug: opts.slug,
      section: opts.section,
      build_run_id: run.id,
      files_touched: filesTouched,
      screenshots,
      critique,
    },
    entity: "build_run",
    entityId: run.id,
  });

  return { approval, screenshots };
}

function listFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (p: string, rel = "") => {
    for (const entry of readdirSync(p, { withFileTypes: true })) {
      const r = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(p, entry.name), r);
      else out.push(r);
    }
  };
  walk(root);
  return out;
}
