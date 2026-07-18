import { humanActor } from "../os/config.js";
import { writeEvent } from "../os/events.js";
import { log } from "../os/log.js";
import { getStore } from "../os/store/index.js";
import type { Contact, Json } from "../os/store/types.js";
import { normalizeEmail } from "./normalize.js";
import { enrichmentProvider } from "./sourcing/providers/index.js";

/**
 * Contact enrichment through the licensed provider (docs/07 step 2):
 * find decision-makers for an account, verify addresses, and record
 * per-field provenance in contacts.enrichment. No provider key means
 * this is a no-op that says so.
 */
export async function enrichAccount(accountId: string, by?: string): Promise<{ found: number; verified: number }> {
  const store = getStore();
  const provider = enrichmentProvider();
  if (!provider) {
    log.warn("no enrichment provider configured (APOLLO_API_KEY or HUNTER_API_KEY). Contacts stay unverified.");
    return { found: 0, verified: 0 };
  }
  const account = await store.get("accounts", accountId);
  if (!account?.domain) throw new Error("account needs a domain to enrich");

  const existing = await store.list("contacts", { where: { account_id: accountId } });
  const people = await provider.searchPeople(account.domain, 5);
  let found = 0;
  let verified = 0;

  for (const p of people) {
    const email = normalizeEmail(p.email?.value);
    const match = existing.find(
      (c) =>
        (email && (c.email ?? "").toLowerCase() === email) ||
        c.full_name.toLowerCase() === p.full_name.value.toLowerCase(),
    );

    const provenance: Json = {};
    for (const [field, v] of Object.entries(p)) {
      if (v) provenance[field] = { provider: v.provider, retrieved_at: v.retrieved_at };
    }

    let contact: Contact;
    if (match) {
      contact = await store.update("contacts", match.id, {
        email: match.email ?? email,
        role: match.role ?? p.role?.value ?? null,
        linkedin_url: match.linkedin_url ?? p.linkedin_url?.value ?? null,
        enrichment: { ...(match.enrichment as Json), ...provenance },
      });
    } else {
      contact = await store.insert("contacts", {
        account_id: accountId,
        full_name: p.full_name.value,
        role: p.role?.value ?? null,
        email,
        linkedin_url: p.linkedin_url?.value ?? null,
        enrichment: provenance,
      });
      found += 1;
    }

    if (contact.email && contact.email_status === "unverified") {
      const { verdict, provider: vp } = await provider.verifyEmail(contact.email);
      if (verdict === "verified") {
        await store.update("contacts", contact.id, {
          email_status: "verified",
          enrichment: { ...(contact.enrichment as Json), email_verification: { provider: vp, at: new Date().toISOString() } },
        });
        verified += 1;
      } else if (verdict === "undeliverable") {
        await store.update("contacts", contact.id, { email_status: "bounced" });
      }
    }
  }

  await writeEvent({
    entity: "account",
    entityId: accountId,
    actor: humanActor(by),
    action: "account.enriched",
    detail: { provider: provider.name, found, verified },
  });
  return { found, verified };
}
