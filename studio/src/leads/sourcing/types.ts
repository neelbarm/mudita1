import type { Json, SourceJobKind } from "../../os/store/types.js";

/**
 * SourceConnector: anything that can discover raw records. Connectors
 * NEVER write accounts or contacts; they land raw_source_records that
 * a human promotes through the sourcing_batch gate.
 */

export interface RawCompany {
  kind: "company";
  name: string;
  domain?: string | null;
  url?: string | null;
  geo?: string | null;
  external_id?: string | null;
  extra?: Json;
}

export interface RawPerson {
  kind: "person";
  full_name: string;
  role?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  company?: string | null;
  domain?: string | null;
  external_id?: string | null;
  /** Per-field provenance: {field: {provider, url, retrievedAt}} */
  provenance?: Json;
}

export interface RawSignal {
  kind: "signal";
  domain: string;
  type: "hiring" | "launch" | "funding" | "content" | "tooling_gap" | "manual_workflow_evidence";
  detail: string;
  url: string;
}

export type RawRecord = RawCompany | RawPerson | RawSignal;

export interface SourceConnector {
  kind: SourceJobKind;
  provider: string;
  discover(query: Json): AsyncGenerator<RawRecord>;
}
