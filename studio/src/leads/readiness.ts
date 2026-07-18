import { ICP_QUALIFY_THRESHOLD, MIN_APPROVED_FACTS } from "../os/constants.js";
import type { StorePort } from "../os/store/index.js";

/**
 * Outreach readiness, docs/07 step 6. THE single source of truth in
 * code; the SQL view v_outreach_ready must agree with this function.
 * Ready means ALL of: verified email, ICP >= 60, >= 3 approved cited
 * facts, no suppression, sequence assigned (or being assigned now).
 */

export interface Readiness {
  ready: boolean;
  reasons: string[];
}

export async function outreachReady(
  store: StorePort,
  contactId: string,
  opts: { assumeSequence?: boolean } = {},
): Promise<Readiness> {
  const reasons: string[] = [];
  const contact = await store.get("contacts", contactId);
  if (!contact) return { ready: false, reasons: ["contact not found"] };

  if (contact.email_status !== "verified") {
    reasons.push(`email is ${contact.email_status}, needs verified`);
  }
  if (contact.opted_out_at) reasons.push("contact opted out (permanent)");
  if (contact.email && (await store.isSuppressed(contact.email))) {
    reasons.push("email is on the permanent suppression list");
  }

  const account = await store.get("accounts", contact.account_id);
  const icp = account?.icp_score ?? 0;
  if (icp < ICP_QUALIFY_THRESHOLD) {
    reasons.push(`icp score ${icp} below ${ICP_QUALIFY_THRESHOLD}`);
  }

  const approvedFacts = await store.count("facts", {
    where: { account_id: contact.account_id, status: "approved" },
  });
  if (approvedFacts < MIN_APPROVED_FACTS) {
    reasons.push(`${approvedFacts} approved facts, needs ${MIN_APPROVED_FACTS}`);
  }

  if (!opts.assumeSequence) {
    const enrollments = await store.list("enrollments", {
      where: { contact_id: contactId, state: ["draft", "pending_approval", "active"] },
    });
    if (enrollments.length === 0) reasons.push("no sequence assigned");
  }

  return { ready: reasons.length === 0, reasons };
}
