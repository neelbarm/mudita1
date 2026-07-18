import { runAgent } from "../../agents/runner.js";
import { getStore } from "../../os/store/index.js";
import { log } from "../../os/log.js";
import type { Approval, Enrollment, SequenceStep } from "../../os/store/types.js";
import { approvedFacts } from "../facts.js";
import { outreachReady } from "../readiness.js";

/**
 * Advance one due enrollment: load the current step, have the Outreach
 * Drafter draft the touch from approved facts only, and land it in the
 * approval queue. The enrollment waits in pending_approval until a
 * human decides; the send effector does the rest.
 */

export async function stepsOf(sequenceId: string): Promise<SequenceStep[]> {
  const steps = await getStore().list("sequence_steps", { where: { sequence_id: sequenceId } });
  return steps.sort((a, b) => a.day_offset - b.day_offset);
}

export async function advanceEnrollment(
  enrollment: Enrollment,
  opts: { trigger?: "cli" | "server" | "n8n" | "sim"; dryRun?: boolean } = {},
): Promise<Approval | null> {
  const store = getStore();
  const steps = await stepsOf(enrollment.sequence_id);
  const step = steps[enrollment.current_step];

  if (!step) {
    await store.update("enrollments", enrollment.id, { state: "finished", next_action_at: null });
    log.info(`enrollment ${enrollment.id.slice(0, 8)} finished (no steps left)`);
    return null;
  }

  const contact = await store.get("contacts", enrollment.contact_id);
  if (!contact) throw new Error(`enrollment ${enrollment.id} has no contact`);

  // Re-check readiness at draft time; things change between days.
  const readiness = await outreachReady(store, contact.id, { assumeSequence: true });
  if (!readiness.ready) {
    await store.update("enrollments", enrollment.id, { state: "paused", next_action_at: null });
    log.warn(`enrollment ${enrollment.id.slice(0, 8)} paused: ${readiness.reasons.join("; ")}`);
    return null;
  }

  const account = await store.get("accounts", contact.account_id);
  const facts = await approvedFacts(contact.account_id);
  const priorTouches = await store.list("touches", {
    where: { enrollment_id: enrollment.id },
    orderBy: "created_at",
  });

  const { approval } = await runAgent(
    "outreach-drafter",
    {
      contact: { full_name: contact.full_name, role: contact.role },
      account: { name: account?.name },
      approved_facts: facts.map((f) => ({ fact: f.fact, source_url: f.source_url })),
      step: { day_offset: step.day_offset, channel: step.channel, template: step.template },
      prior_touches: priorTouches.map((t) => ({ direction: t.direction, channel: t.channel, body: t.body?.slice(0, 400) })),
    },
    {
      trigger: opts.trigger ?? "cli",
      mode: opts.dryRun ? "dry_run" : undefined,
      entity: "enrollment",
      entityId: enrollment.id,
      title: `Outreach day ${step.day_offset} (${step.channel}) to ${contact.full_name}`,
    },
  );

  await store.update("enrollments", enrollment.id, { state: "pending_approval" });
  return approval;
}
