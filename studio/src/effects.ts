/**
 * The single effector registration point. Importing this module wires
 * every approval kind to its real-world effect. The CLI and the server
 * import it once at startup; pipelines get the same wiring through
 * them. Kinds without a specific effector fall back to artifact filing
 * (see src/os/effectors.ts), which is always safe.
 *
 * Later phases register here:
 *   P3 leads:  outreach_message, sourcing_batch, reply_class
 *   P5 money:  invoice_reminder, case_study guard
 *   P6 build:  design_spec, build_review, launch_checklist
 */

import { registerEffector, fileArtifact } from "./os/effectors.js";
import type { Json } from "./os/store/types.js";
import { sendApprovedOutreach } from "./leads/sequence/send.js";
import { applyReplyClass } from "./leads/sequence/replies.js";
import { promoteSourcingBatch } from "./leads/sourcing/promote.js";
import { addCandidateFacts } from "./leads/facts.js";
import { getStore } from "./os/store/index.js";

// Case studies publish only with documented written client approval.
registerEffector("case_study", async (args) => {
  const payload = args.payload as Json;
  if (payload.client_written_approval !== true) {
    throw new Error(
      "case study refused: no documented written client approval on the payload (docs/06 workflow 14).",
    );
  }
  await fileArtifact(args);
});

// The lead engine (P3).
registerEffector("outreach_message", sendApprovedOutreach);
registerEffector("reply_class", applyReplyClass);
registerEffector("sourcing_batch", promoteSourcingBatch);

// An accepted account brief promotes its cited facts to candidates
// and appends the brief's read to icp_notes.
registerEffector("account_brief", async ({ approval, payload }) => {
  const accountId = approval.entity_id;
  await fileArtifact({ approval, payload, decidedBy: approval.decided_by ?? "unknown" });
  if (!accountId) return;
  const facts = (payload.facts as Array<{ fact: string; source_url: string; source_type?: string }>) ?? [];
  await addCandidateFacts(accountId, facts, "account_brief");
  const store = getStore();
  const account = await store.get("accounts", accountId);
  if (account) {
    const note = `[brief] ${String(payload.where_manual_pain_shows ?? "").slice(0, 300)}`;
    await store.update("accounts", accountId, {
      icp_notes: account.icp_notes ? `${account.icp_notes}\n${note}` : note,
      segment: account.segment ?? (payload.suggested_segment as never) ?? null,
    });
  }
});

// Confirmed pain hypotheses become signals rows (cited).
registerEffector("pain_hypotheses", async ({ approval, payload }) => {
  const accountId = approval.entity_id;
  if (!accountId) return;
  const store = getStore();
  const hyps = (payload.hypotheses as Array<{
    hypothesis: string;
    signal_type?: string;
    evidence: Array<{ source_url: string }>;
  }>) ?? [];
  for (const h of hyps) {
    await store.insert("signals", {
      account_id: accountId,
      type: (h.signal_type ?? "manual_workflow_evidence") as never,
      detail: h.hypothesis,
      url: h.evidence[0]?.source_url ?? null,
      observed_at: new Date().toISOString().slice(0, 10),
    });
  }
});
