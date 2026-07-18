import { humanActor } from "../../os/config.js";
import { writeEvent } from "../../os/events.js";
import { log } from "../../os/log.js";
import { getStore } from "../../os/store/index.js";
import type { EffectorArgs } from "../../os/effectors.js";
import { assertSendable, emailFooter } from "../compliance.js";
import { sendEmail } from "../mail/resend.js";
import { stepsOf } from "./advance.js";

/**
 * The send effector for approved outreach_message items. This is the
 * ONLY place an outreach email leaves the studio. Order of operations
 * is the policy: human approval happened first, compliance re-checks
 * anyway, the touch row satisfies the DB constraint with the named
 * approver, and only then does anything send.
 *
 * LinkedIn steps never send from here: approval means "the operator
 * sends this by hand"; the touch records the copy and the approver.
 */
export async function sendApprovedOutreach({ approval, payload, decidedBy }: EffectorArgs): Promise<void> {
  const store = getStore();
  const enrollmentId = approval.entity_id;
  if (!enrollmentId) throw new Error("outreach approval has no enrollment attached");
  const enrollment = await store.get("enrollments", enrollmentId);
  if (!enrollment) throw new Error(`enrollment ${enrollmentId} not found`);
  const contact = await store.get("contacts", enrollment.contact_id);
  if (!contact) throw new Error("enrollment has no contact");

  const channel = String(payload.channel ?? "email") as "email" | "linkedin";
  const body = String(payload.body ?? "");
  const subject = String(payload.subject ?? "");

  // Compliance gate: approval never overrides it.
  await assertSendable(store, contact);

  let sendRef: string | null = null;
  if (channel === "email") {
    const result = await sendEmail({
      to: contact.email as string,
      subject,
      text: body + emailFooter(contact.email as string),
    });
    sendRef = `${result.mode}:${result.ref}`;
  } else {
    log.brass(`linkedin step approved: send by hand to ${contact.full_name}, copy is in the touch record`);
  }

  // The touch row: outbound requires the named approver (DB CHECK).
  const touch = await store.insert("touches", {
    enrollment_id: enrollment.id,
    direction: "outbound",
    channel,
    body: subject ? `Subject: ${subject}\n\n${body}` : body,
    approved_by: decidedBy,
  });

  // Advance the clock to the next step.
  const steps = await stepsOf(enrollment.sequence_id);
  const nextStep = steps[enrollment.current_step + 1];
  const currentStep = steps[enrollment.current_step];
  if (nextStep && currentStep) {
    const deltaDays = nextStep.day_offset - currentStep.day_offset;
    const next = new Date();
    next.setUTCDate(next.getUTCDate() + Math.max(1, deltaDays));
    await store.update("enrollments", enrollment.id, {
      current_step: enrollment.current_step + 1,
      state: "active",
      next_action_at: next.toISOString(),
    });
  } else {
    await store.update("enrollments", enrollment.id, {
      current_step: enrollment.current_step + 1,
      state: "finished",
      next_action_at: null,
    });
  }

  // Mark first-touch accounts as in outreach.
  const account = await store.get("accounts", contact.account_id);
  if (account && ["research", "qualified"].includes(account.status)) {
    await store.update("accounts", account.id, { status: "outreach" });
  }

  await writeEvent({
    entity: "touch",
    entityId: touch.id,
    actor: humanActor(decidedBy),
    action: "touch.sent",
    detail: { channel, send_ref: sendRef, enrollment: enrollment.id },
  });
}
