import { humanActor } from "../../os/config.js";
import { writeEvent } from "../../os/events.js";
import { log } from "../../os/log.js";
import { getStore } from "../../os/store/index.js";
import type { EffectorArgs } from "../../os/effectors.js";
import type { Json, RawSourceRecord } from "../../os/store/types.js";
import { normalizeDomain, normalizeEmail } from "../normalize.js";
import type { RawCompany, RawPerson, RawSignal } from "./types.js";

/**
 * The sourcing_batch effector: a human accepted the batch, so raw
 * records become accounts, contacts, and signals. This is the ONLY
 * path from raw provenance to the CRM (docs/06 §4.3).
 */
export async function promoteSourcingBatch({ approval, payload, decidedBy }: EffectorArgs): Promise<void> {
  const store = getStore();
  const jobId = String(payload.source_job_id ?? approval.entity_id);
  const raws = await store.list("raw_source_records", { where: { source_job_id: jobId }, isNull: ["normalized_at"] });

  let accounts = 0;
  let contacts = 0;
  let signals = 0;

  // Companies first so people can attach.
  for (const raw of raws.filter((r) => r.kind === "company")) {
    const c = raw.raw as unknown as RawCompany;
    const domain = normalizeDomain(c.domain ?? c.url);
    const existing = await findAccount(domain, c.name);
    const account =
      existing ??
      (await store.insert("accounts", {
        name: c.name,
        domain,
        geo: c.geo ?? null,
        source: raw.provider,
        status: "research",
      }));
    if (!existing) {
      accounts += 1;
      await writeEvent({
        entity: "account",
        entityId: account.id,
        actor: humanActor(decidedBy),
        action: "account.created",
        detail: { via: "sourcing_batch", job: jobId, provider: raw.provider },
      });
    }
    await store.update("raw_source_records", raw.id, {
      normalized_at: new Date().toISOString(),
      account_id: account.id,
    } as Partial<RawSourceRecord>);
  }

  for (const raw of raws.filter((r) => r.kind === "person")) {
    const p = raw.raw as unknown as RawPerson;
    const domain = normalizeDomain(p.domain) ?? normalizeEmail(p.email)?.split("@")[1] ?? null;
    const account = (await findAccount(domain, p.company ?? "")) ?? null;
    if (!account) {
      log.warn(`person "${p.full_name}" has no matching account; leaving as raw`);
      continue;
    }
    const email = normalizeEmail(p.email);
    const dupe = (await store.list("contacts", { where: { account_id: account.id } })).find(
      (c) => email && (c.email ?? "").toLowerCase() === email,
    );
    if (dupe) continue;
    const contact = await store.insert("contacts", {
      account_id: account.id,
      full_name: p.full_name,
      role: p.role ?? null,
      email,
      linkedin_url: p.linkedin_url ?? null,
      enrichment: (p.provenance ?? {}) as Json,
    });
    contacts += 1;
    await store.update("raw_source_records", raw.id, {
      normalized_at: new Date().toISOString(),
      contact_id: contact.id,
    } as Partial<RawSourceRecord>);
  }

  for (const raw of raws.filter((r) => r.kind === "signal")) {
    const s = raw.raw as unknown as RawSignal;
    const account = await findAccount(normalizeDomain(s.domain), "");
    if (!account) continue;
    await store.insert("signals", {
      account_id: account.id,
      type: s.type,
      detail: s.detail,
      url: s.url,
      observed_at: new Date().toISOString().slice(0, 10),
    });
    signals += 1;
    await store.update("raw_source_records", raw.id, {
      normalized_at: new Date().toISOString(),
      account_id: account.id,
    } as Partial<RawSourceRecord>);
  }

  log.ok(`promoted batch ${jobId.slice(0, 8)}: +${accounts} accounts, +${contacts} contacts, +${signals} signals`);

  async function findAccount(domain: string | null, name: string) {
    const all = await store.list("accounts");
    if (domain) {
      const byDomain = all.find((a) => a.domain === domain);
      if (byDomain) return byDomain;
    }
    const norm = name.trim().toLowerCase();
    return norm ? (all.find((a) => a.name.trim().toLowerCase() === norm) ?? null) : null;
  }
}
