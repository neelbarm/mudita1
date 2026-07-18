import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { dir } from "../../os/config.js";
import type { Json } from "../../os/store/types.js";
import type { AgentDef } from "../registry.js";
import type { AgentEngine, EngineCtx, EngineResult } from "./types.js";

/**
 * FixtureEngine: deterministic dry-run twin of the live engine. Loads a
 * canned output from fixtures/agents/<slug>/<variant>.json so every
 * pipeline is testable with zero keys. Fixtures must satisfy the same
 * zod schemas as live output; the runner validates both identically.
 */
export class FixtureEngine implements AgentEngine {
  readonly mode = "dry_run" as const;

  async run(def: AgentDef, _input: Json, ctx: EngineCtx): Promise<EngineResult> {
    const variant = ctx.fixture ?? "default";
    const file = path.join(dir.fixtures, "agents", def.slug, `${variant}.json`);
    if (!existsSync(file)) {
      throw new Error(
        `no fixture for agent "${def.slug}" variant "${variant}" (${file}). ` +
          `Add one or set ANTHROPIC_API_KEY for live runs.`,
      );
    }
    const parsed = JSON.parse(readFileSync(file, "utf8")) as { output: unknown };
    return {
      output: parsed.output,
      transcriptPath: file,
      model: "fixture",
      numTurns: 1,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
    };
  }
}
