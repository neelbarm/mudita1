import { cfg } from "../../../os/config.js";
import type { EmailVerdict, EnrichmentProvider, FoundPerson } from "./types.js";

/** Hunter.io adapter (raw fetch). Requires HUNTER_API_KEY. */
export class HunterProvider implements EnrichmentProvider {
  readonly name = "hunter";

  private async call(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
    const qs = new URLSearchParams({ ...params, api_key: cfg.HUNTER_API_KEY as string });
    const res = await fetch(`https://api.hunter.io/v2/${path}?${qs}`);
    if (!res.ok) throw new Error(`hunter ${path}: ${res.status} ${await res.text()}`);
    return (await res.json()) as Record<string, unknown>;
  }

  async searchPeople(domain: string, limit = 5): Promise<FoundPerson[]> {
    const now = new Date().toISOString();
    const data = (await this.call("domain-search", { domain, limit: String(limit) })) as {
      data?: { emails?: Array<Record<string, unknown>> };
    };
    const emails = data.data?.emails ?? [];
    return emails.map((e) => ({
      full_name: {
        value: [e.first_name, e.last_name].filter(Boolean).join(" ") || String(e.value ?? ""),
        provider: this.name,
        retrieved_at: now,
      },
      role: e.position ? { value: String(e.position), provider: this.name, retrieved_at: now } : undefined,
      email: e.value ? { value: String(e.value), provider: this.name, retrieved_at: now } : undefined,
      linkedin_url: e.linkedin ? { value: String(e.linkedin), provider: this.name, retrieved_at: now } : undefined,
    }));
  }

  async verifyEmail(email: string): Promise<{ verdict: EmailVerdict; provider: string }> {
    const data = (await this.call("email-verifier", { email })) as {
      data?: { status?: string; result?: string };
    };
    const result = data.data?.result ?? data.data?.status ?? "";
    const verdict: EmailVerdict =
      result === "deliverable" ? "verified" : result === "undeliverable" ? "undeliverable" : "unverified";
    return { verdict, provider: this.name };
  }
}
