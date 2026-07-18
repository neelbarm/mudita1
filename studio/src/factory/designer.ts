import { runAgent } from "../agents/runner.js";
import { getStore } from "../os/store/index.js";
import type { Approval, Json } from "../os/store/types.js";
import { DesignCritique } from "../agents/schemas.js";

/**
 * The Designer's two modes: spec (full design system + sections) and
 * critic (score screenshots against the craft rubric). Specs land in
 * design_specs and the queue; the design_spec effector writes the
 * approved system into the client codebase.
 */

export async function draftDesignSpec(opts: {
  slug: string;
  brief: Json;
  interview: Json;
  trigger?: "cli" | "server" | "n8n" | "sim";
  dryRun?: boolean;
}): Promise<{ approval: Approval | null; designSpecId: string }> {
  const store = getStore();
  const { run, output } = await runAgent(
    "designer",
    { brief: opts.brief, brand_interview: opts.interview },
    {
      trigger: opts.trigger ?? "cli",
      mode: opts.dryRun ? "dry_run" : undefined,
      skipApproval: true,
    },
  );

  const row = await store.insert("design_specs", {
    version: 1,
    tokens: (output.tokens ?? {}) as Json,
    type_system: (output.type_system ?? {}) as Json,
    motion: (output.motion ?? {}) as Json,
    sections: (output.sections ?? []) as unknown[],
    status: "draft",
  });

  const { createApproval } = await import("../os/approvals.js");
  const approval = await createApproval({
    kind: "design_spec",
    title: `Design spec: ${String((output.brand as Json | undefined)?.name ?? opts.slug)}`,
    summary: `${((output.sections as unknown[]) ?? []).length} sections; signature: ${String(((output.signature_moment as Json | undefined)?.description ?? "")).slice(0, 120)}`,
    payload: { slug: opts.slug, design_spec_id: row.id, ...output },
    agentRunId: run.id,
    entity: "design_spec",
    entityId: row.id,
  });
  return { approval, designSpecId: row.id };
}

export async function critiqueScreens(opts: {
  slug: string;
  section: string;
  screenshotPaths: string[];
  spec: Json;
  trigger?: "cli" | "server" | "n8n" | "sim";
  dryRun?: boolean;
}): Promise<Json> {
  const { output } = await runAgent(
    "designer",
    {
      mode: "critic",
      section: opts.section,
      screenshots: opts.screenshotPaths,
      spec: { brand: opts.spec.brand, sections: opts.spec.sections },
    },
    {
      trigger: opts.trigger ?? "cli",
      mode: opts.dryRun ? "dry_run" : undefined,
      zodOverride: DesignCritique,
      fixture: "critic",
      extraSystem:
        "CRITIC MODE. You are scoring the attached screenshots against the craft rubric. Read the screenshot files with the Read tool when running live. Output the DesignCritique schema only.",
      skipApproval: true,
    },
  );
  return output;
}
