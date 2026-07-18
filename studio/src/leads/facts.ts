import { humanActor } from "../os/config.js";
import { writeEvent } from "../os/events.js";
import { getStore } from "../os/store/index.js";
import type { Fact, Json } from "../os/store/types.js";

/**
 * Facts: the cited raw material outreach is allowed to use. Candidates
 * arrive from approved account briefs; a human approves each fact
 * before the Outreach Drafter may see it.
 */

export async function addCandidateFacts(
  accountId: string,
  facts: Array<{ fact: string; source_url: string; source_type?: string }>,
  source: string,
): Promise<Fact[]> {
  const store = getStore();
  const existing = await store.list("facts", { where: { account_id: accountId } });
  const seen = new Set(existing.map((f) => f.fact.toLowerCase().trim()));
  const created: Fact[] = [];
  for (const f of facts) {
    if (seen.has(f.fact.toLowerCase().trim())) continue;
    created.push(
      await store.insert("facts", {
        account_id: accountId,
        fact: f.fact,
        source_url: f.source_url,
        source_type: f.source_type ?? source,
      }),
    );
  }
  return created;
}

export async function approveFact(factId: string, approvedBy: string): Promise<Fact> {
  const store = getStore();
  const fact = await store.update("facts", factId, {
    status: "approved",
    approved_by: approvedBy,
  });
  await writeEvent({
    entity: "account",
    entityId: fact.account_id,
    actor: humanActor(approvedBy),
    action: "fact.approved",
    detail: { fact: fact.fact } as Json,
  });
  return fact;
}

export async function approvedFacts(accountId: string): Promise<Fact[]> {
  return getStore().list("facts", { where: { account_id: accountId, status: "approved" } });
}
