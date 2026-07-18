import type { AgentDef } from "../registry.js";
import type { Json } from "../../os/store/types.js";

export interface EngineResult {
  /** Raw structured output, pre zod-validation. */
  output: unknown;
  transcriptPath: string | null;
  model: string | null;
  numTurns: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: number | null;
}

export interface EngineCtx {
  runId: string;
  /** Working directory for tool-using agents (Builder). */
  cwd?: string;
  /** Extra system prompt appended after the agent prompt (e.g. critic mode). */
  extraSystem?: string;
  /** JSON schema override (e.g. Designer critic mode). */
  schemaOverride?: object;
  /** Fixture variant name for dry runs (default "default"). */
  fixture?: string;
}

export interface AgentEngine {
  readonly mode: "live" | "dry_run";
  run(def: AgentDef, input: Json, ctx: EngineCtx): Promise<EngineResult>;
}
