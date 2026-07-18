import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { dir } from "../os/config.js";
import { log } from "../os/log.js";
import { getStore } from "../os/store/index.js";
import type { Json } from "../os/store/types.js";
import { tokensCssFromSpec } from "./tokens.js";

/**
 * Scaffold a client app from the studio template: copy, brand, write
 * the approved design system in, git init, install. Client work lives
 * in studio/clients/<slug>/ (gitignored: client IP stays out of the
 * studio repo; push to the client's own remote at onboarding).
 */
export async function scaffoldClient(opts: {
  slug: string;
  name: string;
  spec: Json;
  install?: boolean;
}): Promise<string> {
  const target = path.join(dir.clients, opts.slug);
  if (existsSync(path.join(target, "package.json"))) {
    log.warn(`${opts.slug} already scaffolded; leaving it as is`);
    return target;
  }
  mkdirSync(target, { recursive: true });
  cpSync(path.join(dir.templates, "client-app"), target, { recursive: true });

  // Brand the placeholders in every text file.
  brand(target, { __SLUG__: opts.slug, __NAME__: opts.name });

  // The approved design system, written in.
  writeFileSync(path.join(target, "src", "design", "tokens.css"), tokensCssFromSpec(opts.spec));
  writeFileSync(path.join(target, "src", "design", "spec.json"), JSON.stringify(opts.spec, null, 2));

  execFileSync("git", ["init", "-q"], { cwd: target });
  execFileSync("git", ["add", "-A"], { cwd: target });
  execFileSync("git", ["-c", "user.email=studio@sargahaus.com", "-c", "user.name=Sarga Studio", "commit", "-qm", "Scaffold from studio template with approved design system"], { cwd: target });

  if (opts.install !== false) {
    log.info(`installing dependencies for ${opts.slug} (a few minutes on first run)...`);
    execFileSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: target, stdio: "inherit", timeout: 600_000 });
  }

  await getStore().insert("build_runs", {
    project_slug: opts.slug,
    phase: "scaffold",
    status: "passed",
  });
  log.ok(`scaffolded clients/${opts.slug}`);
  return target;
}

function brand(root: string, replacements: Record<string, string>) {
  const walk = (p: string) => {
    for (const entry of readdirSync(p)) {
      if (entry === "node_modules" || entry === ".git") continue;
      const full = path.join(p, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx|json|md|css|mjs|example)$/.test(entry) && !entry.startsWith(".env")) continue;
      let text = readFileSync(full, "utf8");
      let changed = false;
      for (const [from, to] of Object.entries(replacements)) {
        if (text.includes(from)) {
          text = text.split(from).join(to);
          changed = true;
        }
      }
      if (changed) writeFileSync(full, text);
    }
  };
  walk(root);
}
