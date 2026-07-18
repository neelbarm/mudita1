import { createApproval } from "../../os/approvals.js";
import { log } from "../../os/log.js";
import { getStore } from "../../os/store/index.js";
import type { Approval, Json, SourceJob } from "../../os/store/types.js";
import { companyDedupeKey, personDedupeKey } from "../dedupe.js";
import type { RawRecord, SourceConnector } from "./types.js";

/**
 * Run one sourcing job: discover raw records, dedupe against
 * everything already landed, store the fresh ones, and put ONE
 * sourcing_batch item in the approval queue. Promotion to accounts
 * and contacts happens exclusively through that gate (docs/06 §4).
 */
export async function runSourceJob(
  connector: SourceConnector,
  query: Json,
): Promise<{ job: SourceJob; fresh: number; duplicates: number; approval: Approval | null }> {
  const store = getStore();
  let job = await store.insert("source_jobs", {
    kind: connector.kind,
    provider: connector.provider,
    query,
    started_at: new Date().toISOString(),
  });

  const existingKeys = new Set(
    (await store.list("raw_source_records")).map((r) => r.dedupe_key).filter(Boolean) as string[],
  );

  let fresh = 0;
  let duplicates = 0;
  const sample: string[] = [];

  try {
    for await (const record of connector.discover(query)) {
      const dedupeKey = keyOf(record);
      if (dedupeKey && existingKeys.has(dedupeKey)) {
        duplicates += 1;
        continue;
      }
      if (dedupeKey) existingKeys.add(dedupeKey);
      await store.insert("raw_source_records", {
        source_job_id: job.id,
        provider: connector.provider,
        external_id: "external_id" in record ? (record.external_id ?? null) : null,
        url: "url" in record ? (record.url ?? null) : null,
        kind: record.kind,
        raw: record as unknown as Json,
        dedupe_key: dedupeKey,
      });
      fresh += 1;
      if (sample.length < 6) sample.push(labelOf(record));
    }

    job = await store.update("source_jobs", job.id, {
      status: "succeeded",
      finished_at: new Date().toISOString(),
      stats: { fresh, duplicates },
    });

    let approval: Approval | null = null;
    if (fresh > 0) {
      approval = await createApproval({
        kind: "sourcing_batch",
        title: `Sourcing batch: ${fresh} fresh from ${connector.provider} (${duplicates} duplicates skipped)`,
        summary: sample.join(" · "),
        payload: { source_job_id: job.id, fresh, duplicates, sample },
        entity: "source_job",
        entityId: job.id,
      });
    } else {
      log.info("sourcing found nothing new; no batch queued");
    }
    return { job, fresh, duplicates, approval };
  } catch (err) {
    await store.update("source_jobs", job.id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
      finished_at: new Date().toISOString(),
    });
    throw err;
  }
}

function keyOf(r: RawRecord): string | null {
  if (r.kind === "company") return companyDedupeKey(r);
  if (r.kind === "person") return personDedupeKey(r);
  return `s:${r.domain}:${r.type}:${r.detail.slice(0, 40).toLowerCase()}`;
}

function labelOf(r: RawRecord): string {
  if (r.kind === "company") return r.name;
  if (r.kind === "person") return r.full_name;
  return `${r.type}@${r.domain}`;
}
