import { humanActor } from "./config.js";
import { writeEvent } from "./events.js";
import { getEffector } from "./effectors.js";
import { notify } from "./notify.js";
import { getStore } from "./store/index.js";
import type { Approval, ApprovalKind, Json } from "./store/types.js";

/**
 * The approval queue: the one gate between agent drafts and the world.
 * Every item is created with a [draft] prefix (docs/08 rule 6) and
 * stays inert until a named human decides it. Approval dispatches the
 * kind's effector; rejection just records why.
 */

export async function createApproval(a: {
  kind: ApprovalKind;
  title: string;
  summary?: string;
  payload: Json;
  agentRunId?: string;
  entity?: string;
  entityId?: string;
  expiresAt?: string;
}): Promise<Approval> {
  const title = a.title.startsWith("[draft]") ? a.title : `[draft] ${a.title}`;
  const approval = await getStore().insert("approvals", {
    kind: a.kind,
    title,
    summary: a.summary ?? null,
    payload: a.payload,
    agent_run_id: a.agentRunId ?? null,
    entity: a.entity ?? null,
    entity_id: a.entityId ?? null,
    expires_at: a.expiresAt ?? null,
  });
  await notify(`queue: ${title} (${a.kind}) awaiting review. sarga approve`);
  return approval;
}

export async function listPending(): Promise<Record<string, unknown>[]> {
  return getStore().view("v_approval_queue");
}

export async function decide(
  id: string,
  d: {
    decision: "approved" | "rejected";
    decidedBy?: string;
    note?: string;
    editedPayload?: Json;
  },
): Promise<Approval> {
  const store = getStore();
  const approval = await store.get("approvals", id);
  if (!approval) throw new Error(`approval ${id} not found`);
  if (approval.status !== "pending") {
    throw new Error(`approval ${id} is ${approval.status}, not pending`);
  }
  const decidedBy = d.decidedBy ?? humanActor().slice("human:".length);

  // The equity cooling-off rule (docs/06 §8): a legal_draft carrying an
  // equity memo cannot be approved before its cooling-off timestamp.
  if (d.decision === "approved" && approval.kind === "legal_draft") {
    const cool = (approval.payload as { cooling_off_until?: string }).cooling_off_until;
    if (cool && new Date(cool).getTime() > Date.now()) {
      throw new Error(
        `equity memo is in its 48h cooling-off window until ${cool}. Sleep on it; that is the point.`,
      );
    }
  }

  const updated = await store.update("approvals", id, {
    status: d.decision,
    decided_by: decidedBy,
    decided_at: new Date().toISOString(),
    decision_note: d.note ?? null,
    edited_payload: d.editedPayload ?? null,
  });

  await writeEvent({
    entity: "approval",
    entityId: id,
    actor: humanActor(decidedBy),
    action: `approval.${d.decision}`,
    detail: { kind: approval.kind, title: approval.title, note: d.note ?? null },
  });

  if (d.decision === "approved") {
    const effector = getEffector(approval.kind);
    await effector({
      approval: updated,
      payload: (d.editedPayload ?? approval.payload) as Json,
      decidedBy,
    });
  }
  return updated;
}
