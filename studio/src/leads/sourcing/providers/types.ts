/**
 * Licensed enrichment providers, behind one interface. Every returned
 * field carries provenance (docs/07 step 2: per-field source of
 * record). The studio uses whichever provider has a key; none is fine.
 */

export interface Provenanced<T> {
  value: T;
  provider: string;
  retrieved_at: string;
  url?: string;
}

export interface FoundPerson {
  full_name: Provenanced<string>;
  role?: Provenanced<string>;
  email?: Provenanced<string>;
  linkedin_url?: Provenanced<string>;
}

export type EmailVerdict = "verified" | "unverified" | "undeliverable";

export interface EnrichmentProvider {
  readonly name: string;
  /** People at a company domain, decision-makers first. */
  searchPeople(domain: string, limit?: number): Promise<FoundPerson[]>;
  /** Verify one address. */
  verifyEmail(email: string): Promise<{ verdict: EmailVerdict; provider: string }>;
}
