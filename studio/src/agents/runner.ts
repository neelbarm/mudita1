import { z } from "zod";
import { caps } from "../os/capabilities.js";
import { createApproval } from "../os/approvals.js";
import { writeEvent } from "../os/events.js";
import { runId as newRunId } from "../os/ids.js";
import { log } from "../os/log.js";
import { getStore } from "../os/store/index.js";
import type { AgentRun, Approval, ApprovalKind, Json } from "../os/store/types.js";
import { ClaudeEngine } from "./engines/claude.js";
import { FixtureEngine } from "./engines/fixture.js";
import type { AgentEngine } from "./engines/types.js";
import { getAgent } from "./registry.js";
import { EQUITY_COOLING_OFF_HOURS } from "../os/constants.js";
import { addHours, nowIso } from "../os/time.js";

/**
 * The runner: one path for all 17 agents. Records the run, executes
 * the engine (live or fixture), validates against the agent's schema,
 * applies hard post-processors, writes the audit event, and lands the
 * draft in the approval queue. Draft is the terminal state of every
 * agent run; humans take it from there.
 */

export interface RunAgentOpts {
  trigger?: AgentRun["trigger"];
  mode?: "live" | "dry_run";
  cwd?: string;
  extraSystem?: string;
  /** zod override for special modes (e.g. Designer as critic). */
  zodOverride?: z.ZodTypeAny;
  fixture?: string;
  entity?: string;
  entityId?: string;
  /** When true the caller owns queueing (used by pipelines mid-flow). */
  skipApproval?: boolean;
  title?: string;
  summary?: string;
  approvalKindOverride?: ApprovalKind;
  expiresAt?: string;
}

export interface RunAgentResult {
  run: AgentRun;
  output: Json;
  approval: Approval | null;
}

export async function runAgent(slug: string, input: Json, opts: RunAgentOpts = {}): Promise<RunAgentResult> {
  const def = getAgent(slug);
  const store = getStore();
  const mode = opts.mode ?? (caps.agentsLive() ? "live" : "dry_run");
  const engine: AgentEngine = mode === "live" ? new ClaudeEngine() : new FixtureEngine();
  const rid = newRunId();
  const started = Date.now();

  let run = await store.insert("agent_runs", {
    agent: def.slug,
    mode,
    status: "running",
    trigger: opts.trigger ?? "cli",
    input,
    entity: opts.entity ?? def.entity,
    entity_id: opts.entityId ?? null,
    model: mode === "dry_run" ? "fixture" : null,
  });

  try {
    const schema = opts.zodOverride ?? def.outputSchema;
    const engineResult = await engine.run(def, input, {
      runId: rid,
      cwd: opts.cwd,
      extraSystem: opts.extraSystem,
      schemaOverride: mode === "live" ? z.toJSONSchema(schema) : undefined,
      fixture: opts.fixture,
    });

    const parsed = schema.safeParse(engineResult.output);
    if (!parsed.success) {
      throw new Error(`agent output failed schema validation: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    }
    let output = parsed.data as Json;
    output = applyPostProcessors(def.slug, output, input);

    run = await store.update("agent_runs", run.id, {
      status: "succeeded",
      output,
      model: engineResult.model,
      num_turns: engineResult.numTurns,
      input_tokens: engineResult.inputTokens,
      output_tokens: engineResult.outputTokens,
      cost_usd: engineResult.costUsd,
      duration_ms: Date.now() - started,
      transcript_path: engineResult.transcriptPath,
    });

    await writeEvent({
      entity: run.entity ?? def.entity,
      entityId: run.entity_id ?? run.id,
      actor: `agent:${def.slug}`,
      action: `${def.slug}.drafted`,
      detail: { run: run.id, mode },
    });

    let approval: Approval | null = null;
    const kind = resolveApprovalKind(def.slug, output, opts.approvalKindOverride ?? def.approvalKind);
    if (kind && !opts.skipApproval) {
      approval = await createApproval({
        kind,
        title: opts.title ?? `${def.title}: ${titleOf(output) ?? def.job.slice(0, 60)}`,
        summary: opts.summary ?? summarize(output),
        payload: output,
        agentRunId: run.id,
        entity: run.entity ?? undefined,
        entityId: run.entity_id ?? undefined,
        expiresAt: opts.expiresAt,
      });
    }

    log.ok(`${def.slug} ${mode} run ${run.id.slice(0, 8)} succeeded${approval ? ` -> approval ${approval.id.slice(0, 8)}` : ""}`);
    return { run, output, approval };
  } catch (err) {
    await store.update("agent_runs", run.id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - started,
    });
    throw err;
  }
}

/** Case studies route to their own gate with the written-approval rule. */
function resolveApprovalKind(slug: string, output: Json, base: ApprovalKind | null): ApprovalKind | null {
  if (slug === "content-writer" && output.kind === "case_study") return "case_study";
  return base;
}

// -------------------------------------------------- hard post-processors --

export const ATTORNEY_STAMP =
  "> DRAFT for attorney review. Prepared by the studio's drafting agent from studio templates. This is not legal advice and creates no attorney-client relationship.";

function applyPostProcessors(slug: string, output: Json, input: Json): Json {
  if (slug === "legal-drafter") {
    const body = String(output.body_markdown ?? "");
    if (!body.includes("DRAFT for attorney review")) {
      output.body_markdown = `${ATTORNEY_STAMP}\n\n${body}`;
    }
    if (output.doc_type === "equity_memo") {
      // 48h cooling-off (docs/06 §8): approvals.decide refuses earlier.
      output.cooling_off_until = addHours(nowIso(), EQUITY_COOLING_OFF_HOURS);
    }
  }
  if (slug === "finance-analyst") {
    assertNoInventedFigures(output, input);
  }
  return output;
}

/**
 * Finance rule: code computes, the agent narrates. Every number in the
 * narrative and recommendations must exist in the computed input or in
 * figures_used (which itself must come from the input). Single digits
 * pass (ordinal prose like "3 invoices" where 3 is computed anyway is
 * covered; "two options" style prose needs no digits).
 */
export function assertNoInventedFigures(output: Json, input: Json): void {
  const allowed = new Set<string>();
  collectNumbers(JSON.stringify(input), allowed);
  for (const f of (output.figures_used as Array<{ value: number }> | undefined) ?? []) {
    allowed.add(normalizeNum(String(f.value)));
  }
  for (let i = 0; i <= 9; i++) allowed.add(String(i));

  const recs = Array.isArray(output.recommendations) ? (output.recommendations as string[]) : [];
  const text = [String(output.narrative ?? ""), ...recs].join("\n");
  const nums = text.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
  for (const n of nums) {
    if (!allowed.has(normalizeNum(n))) {
      throw new Error(
        `finance narrative contains a figure not present in computed input: "${n}". Code computes; agents narrate.`,
      );
    }
  }
}

function collectNumbers(s: string, into: Set<string>): void {
  // Plain digits only: comma grouping here would merge JSON arrays
  // ("[3,7,10,14]" must yield four numbers, not "71014").
  for (const n of s.match(/\d+(?:\.\d+)?/g) ?? []) into.add(normalizeNum(n));
}

function normalizeNum(n: string): string {
  const x = Number(n.replace(/,/g, ""));
  return Number.isInteger(x) ? String(x) : String(x);
}

function titleOf(output: Json): string | null {
  for (const k of ["title", "subject", "account_name", "project_name", "tldr", "week_of"]) {
    const v = output[k];
    if (typeof v === "string" && v.length > 0) return v.slice(0, 80);
  }
  return null;
}

function summarize(output: Json): string {
  const s = JSON.stringify(output);
  return s.length > 240 ? s.slice(0, 237) + "..." : s;
}
