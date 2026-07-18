import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { cfg, dir } from "../../os/config.js";
import type { Json } from "../../os/store/types.js";
import type { AgentDef } from "../registry.js";
import type { AgentEngine, EngineCtx, EngineResult } from "./types.js";

/**
 * ClaudeEngine: live agent runs on the Claude Agent SDK. One harness
 * for all 17 agents. Text agents run with zero tools; the Builder gets
 * coding tools jailed to its client directory. settingSources stays
 * empty so no user or project settings ever leak into agent runs.
 */

function loadPrompt(def: AgentDef): string {
  const preamble = readFileSync(path.join(dir.prompts, "_preamble.md"), "utf8");
  const prompt = readFileSync(path.join(dir.prompts, def.promptPath), "utf8");
  const skills = def.skillPaths
    .map((p) => readFileSync(path.join(dir.skills, p), "utf8"))
    .join("\n\n---\n\n");
  return [preamble, prompt, skills].filter(Boolean).join("\n\n---\n\n");
}

/** Path jail + Bash allowlist for tool-using agents. */
function guardFor(def: AgentDef, ctx: EngineCtx) {
  const jail = ctx.cwd ? path.resolve(ctx.cwd) : null;
  const BASH_ALLOW = [/^npm (run |install|ci)/, /^npx (next|playwright|tsc)/, /^node /, /^git (status|diff|add|commit|init|log)/, /^ls /, /^mkdir /];
  return async (toolName: string, input: Record<string, unknown>) => {
    if (toolName === "Bash") {
      const cmd = String(input.command ?? "");
      if (!BASH_ALLOW.some((re) => re.test(cmd))) {
        return { behavior: "deny" as const, message: `command not in the studio allowlist: ${cmd.slice(0, 80)}` };
      }
    }
    if (jail && ["Write", "Edit"].includes(toolName)) {
      const p = String(input.file_path ?? "");
      if (!path.resolve(p).startsWith(jail)) {
        return { behavior: "deny" as const, message: `writes are jailed to ${jail}` };
      }
    }
    return { behavior: "allow" as const, updatedInput: input };
  };
}

export class ClaudeEngine implements AgentEngine {
  readonly mode = "live" as const;

  async run(def: AgentDef, input: Json, ctx: EngineCtx): Promise<EngineResult> {
    const runDir = path.join(dir.runs, ctx.runId);
    mkdirSync(runDir, { recursive: true });
    const transcriptPath = path.join(runDir, "transcript.jsonl");

    const schema = ctx.schemaOverride;
    const system =
      loadPrompt(def) +
      (ctx.extraSystem ? `\n\n---\n\n${ctx.extraSystem}` : "") +
      "\n\nRespond ONLY with a single JSON object matching the required schema. No prose around it.";

    const q = query({
      prompt: `Input:\n\`\`\`json\n${JSON.stringify(input, null, 2)}\n\`\`\``,
      options: {
        systemPrompt: system,
        allowedTools: def.tools,
        settingSources: [],
        permissionMode: "default",
        canUseTool: guardFor(def, ctx),
        maxTurns: def.maxTurns,
        model: cfg.model,
        ...(ctx.cwd ? { cwd: ctx.cwd } : {}),
        ...(schema ? { outputFormat: { type: "json_schema", schema } } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    let output: unknown = null;
    let numTurns: number | null = null;
    let inputTokens: number | null = null;
    let outputTokens: number | null = null;
    let costUsd: number | null = null;
    let model: string | null = null;
    let resultText = "";

    for await (const m of q) {
      appendFileSync(transcriptPath, JSON.stringify(m) + "\n");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = m as any;
      if (msg.type === "system" && msg.subtype === "init") model = msg.model ?? null;
      if (msg.type === "result") {
        numTurns = msg.num_turns ?? null;
        costUsd = msg.total_cost_usd ?? null;
        inputTokens = msg.usage?.input_tokens ?? null;
        outputTokens = msg.usage?.output_tokens ?? null;
        if (msg.is_error) throw new Error(`agent run failed: ${msg.subtype ?? "error"}`);
        output = msg.structured_output ?? null;
        resultText = typeof msg.result === "string" ? msg.result : "";
      }
    }

    if (output == null) output = parseJsonLoose(resultText);
    return { output, transcriptPath, model, numTurns, inputTokens, outputTokens, costUsd };
  }
}

/** Parse JSON out of a model reply, tolerating code fences and prose. */
export function parseJsonLoose(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? text).trim();
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("agent reply contained no parseable JSON object");
  }
}
