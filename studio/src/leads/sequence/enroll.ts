import { humanActor } from "../../os/config.js";
import { writeEvent } from "../../os/events.js";
import { getStore } from "../../os/store/index.js";
import type { Enrollment } from "../../os/store/types.js";
import { outreachReady } from "../readiness.js";

/**
 * Enrollment: a contact enters a sequence. Guarded by the readiness
 * gate in code, the suppression check in the store invariants, and the
 * database trigger as the last line. Nothing here sends anything.
 */

export async function enrollContact(
  contactId: string,
  opts: { sequenceId?: string; by?: string; startAt?: string } = {},
): Promise<Enrollment> {
  const store = getStore();

  const readiness = await outreachReady(store, contactId, { assumeSequence: true });
  if (!readiness.ready) {
    throw new Error(`contact is not outreach-ready: ${readiness.reasons.join("; ")}`);
  }

  let sequenceId = opts.sequenceId;
  if (!sequenceId) {
    const active = await store.list("sequences", { where: { status: "active" } });
    if (active.length === 0) throw new Error("no active sequence; run sarga db push --seed or create one");
    sequenceId = active[0]!.id;
  }

  const existing = await store.list("enrollments", {
    where: { contact_id: contactId, state: ["draft", "pending_approval", "active"] },
  });
  if (existing.length > 0) return existing[0]!;

  const enrollment = await store.insert("enrollments", {
    contact_id: contactId,
    sequence_id: sequenceId,
    state: "draft",
    current_step: 0,
    next_action_at: opts.startAt ?? new Date().toISOString(),
  });
  await writeEvent({
    entity: "enrollment",
    entityId: enrollment.id,
    actor: humanActor(opts.by),
    action: "enrollment.created",
    detail: { contact_id: contactId, sequence_id: sequenceId },
  });
  return enrollment;
}
