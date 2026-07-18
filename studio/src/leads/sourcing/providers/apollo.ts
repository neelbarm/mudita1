import { cfg } from "../../../os/config.js";
import type { EmailVerdict, EnrichmentProvider, FoundPerson } from "./types.js";

/**
 * Apollo.io adapter (raw fetch, no SDK). Requires APOLLO_API_KEY.
 * Endpoints per Apollo's public REST API; responses are mapped into
 * provenance triples and nothing else is kept.
 */
export class ApolloProvider implements EnrichmentProvider {
  readonly name = "apollo";

  private async call(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await fetch(`https://api.apollo.io/api/v1/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": cfg.APOLLO_API_KEY as string,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`apollo ${path}: ${res.status} ${await res.text()}`);
    return (await res.json()) as Record<string, unknown>;
  }

  async searchPeople(domain: string, limit = 5): Promise<FoundPerson[]> {
    const now = new Date().toISOString();
    const data = await this.call("mixed_people/search", {
      q_organization_domains: domain,
      person_seniorities: ["owner", "founder", "c_suite", "partner"],
      page: 1,
      per_page: limit,
    });
    const people = (data.people as Array<Record<string, unknown>> | undefined) ?? [];
    return people.map((p) => ({
      full_name: { value: String(p.name ?? ""), provider: this.name, retrieved_at: now },
      role: p.title ? { value: String(p.title), provider: this.name, retrieved_at: now } : undefined,
      email:
        p.email && p.email !== "email_not_unlocked@domain.com"
          ? { value: String(p.email), provider: this.name, retrieved_at: now }
          : undefined,
      linkedin_url: p.linkedin_url
        ? { value: String(p.linkedin_url), provider: this.name, retrieved_at: now }
        : undefined,
    }));
  }

  async verifyEmail(email: string): Promise<{ verdict: EmailVerdict; provider: string }> {
    const data = await this.call("email_verifications/verify", { email });
    const status = String((data as { email_verification?: { status?: string } }).email_verification?.status ?? "");
    const verdict: EmailVerdict =
      status === "verified" ? "verified" : status === "undeliverable" ? "undeliverable" : "unverified";
    return { verdict, provider: this.name };
  }
}
