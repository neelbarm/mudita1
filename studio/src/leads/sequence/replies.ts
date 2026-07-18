import { humanActor } from "../../os/config.js";
import { createApproval } from "../../os/approvals.js";
import { writeEvent } from "../../os/events.js";
import { notify } from "../../os/notify.js";
import { getStore } from "../../os/store/index.js";
import type { EffectorArgs } from "../../os/effectors.js";
import type { Approval, ReplyClass, Touch } from "../../os/store/types.js";
import { normalizeEmail } from "../normalize.js";
import { suppress } from "../mail/unsubscribe.js";

/**
 * Inbound replies: recorded as touches, classified by deterministic
 * suggestion, confirmed by a human (docs/07 step 9), then routed.
 * Interested replies demand a same-day human response; the queue item
 * and the notification both say so.
 */

export function suggestReplyClass(body: string): ReplyClass {
  const t = body.toLowerCase();
  if (/(unsubscribe|remove me|take me off|stop emailing|opt out|opt-out)/.test(t)) return "opt_out";
  if (/(not interested|no thanks|no thank you|please don't|pass on this)/.test(t)) return "negative";
  if (/(next quarter|later this year|in a few months|not right now|circle back|down the road)/.test(t)) return "later";
  if (/(out of office|auto-?reply|automatic reply|on vacation)/.test(t)) return "auto";
  if (/(you should talk to|forwarding you|referred|right person is)/.test(t)) return "referral";
  if (/(interested|let's talk|call|chat|demo|sounds good|tell me more|book)/.test(t)) return "interested";
  return "question";
}

export async function ingestReply(mail: {
  from: string;
  subject?: string;
  body: string;
}): Promise<{ touch: Touch; approval: Approval } | null> {
  const store = getStore();
  const email = normalizeEmail(mail.from);
  if (!email) return null;

  const contact = (await store.list("contacts")).find(
    (c) => (c.email ?? "").toLowerCase() === email,
  );
  if (!contact) {
    await notify(`inbound reply from unknown address ${email}: "${(mail.subject ?? mail.body).slice(0, 60)}"`);
    return null;
  }

  const enrollments = await store.list("enrollments", {
    where: { contact_id: contact.id },
    orderBy: "created_at",
    ascending: false,
  });
  const enrollment = enrollments[0];
  if (!enrollment) return null;

  const touch = await store.insert("touches", {
    enrollment_id: enrollment.id,
    direction: "inbound",
    channel: "email",
    body: `${mail.subject ? `Subject: ${mail.subject}\n\n` : ""}${mail.body}`,
  });
  if (!["finished", "opted_out"].includes(enrollment.state)) {
    await store.update("enrollments", enrollment.id, { state: "replied", next_action_at: null });
  }

  const suggested = suggestReplyClass(mail.body);
  const approval = await createApproval({
    kind: "reply_class",
    title: `Reply from ${contact.full_name}: suggested ${suggested}${suggested === "interested" ? " (respond today)" : ""}`,
    summary: mail.body.slice(0, 200),
    payload: {
      touch_id: touch.id,
      contact_id: contact.id,
      enrollment_id: enrollment.id,
      suggested,
      body: mail.body,
    },
    entity: "enrollment",
    entityId: enrollment.id,
  });
  if (suggested === "interested") {
    await notify(`interested reply from ${contact.full_name}. Same-day human response is the rule. sarga approve`);
  }
  return { touch, approval };
}

/** Effector: a human confirmed the class; apply it and route. */
export async function applyReplyClass({ payload, decidedBy }: EffectorArgs): Promise<void> {
  const store = getStore();
  const cls = (payload.confirmed_class ?? payload.suggested) as ReplyClass;
  const touchId = String(payload.touch_id);
  const contactId = String(payload.contact_id);
  const enrollmentId = String(payload.enrollment_id);

  await store.update("touches", touchId, { reply_class: cls });
  const contact = await store.get("contacts", contactId);

  switch (cls) {
    case "opt_out": {
      if (contact?.email) await suppress(contact.email, "opt_out", "reply");
      break;
    }
    case "negative": {
      await store.update("enrollments", enrollmentId, { state: "finished", next_action_at: null });
      break;
    }
    case "later": {
      const recycle = new Date();
      recycle.setUTCDate(recycle.getUTCDate() + 60);
      await store.update("enrollments", enrollmentId, { state: "paused", next_action_at: recycle.toISOString() });
      if (contact) {
        const account = await store.get("accounts", contact.account_id);
        if (account) await store.update("accounts", account.id, { status: "recycled" });
      }
      break;
    }
    case "interested": {
      if (contact) {
        const account = await store.get("accounts", contact.account_id);
        if (account) {
          await store.update("accounts", account.id, { status: "conversation" });
          await writeEvent({
            entity: "account",
            entityId: account.id,
            actor: humanActor(decidedBy),
            action: "account.conversation",
            detail: { via: "reply", touch: touchId },
          });
        }
      }
      await notify(`conversation opened: reply today, book the call.`);
      break;
    }
    case "question": {
      await notify("question reply confirmed: same-day human answer is the rule.");
      break;
    }
    case "referral":
    case "auto":
      break;
  }

  await writeEvent({
    entity: "touch",
    entityId: touchId,
    actor: humanActor(decidedBy),
    action: "reply.classified",
    detail: { class: cls },
  });
}

/** Hard bounce from the provider webhook: verify status, suppress. */
export async function handleBounce(email: string, permanent: boolean): Promise<void> {
  const store = getStore();
  const lower = email.toLowerCase();
  const contacts = (await store.list("contacts")).filter((c) => (c.email ?? "").toLowerCase() === lower);
  for (const c of contacts) {
    await store.update("contacts", c.id, { email_status: "bounced" });
  }
  if (permanent) await suppress(lower, "hard_bounce", "resend-webhook");
}
