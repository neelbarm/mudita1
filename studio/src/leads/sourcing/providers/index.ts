import { caps } from "../../../os/capabilities.js";
import { ApolloProvider } from "./apollo.js";
import { HunterProvider } from "./hunter.js";
import type { EnrichmentProvider } from "./types.js";

/** The configured provider, or null when no licensed key exists. */
export function enrichmentProvider(): EnrichmentProvider | null {
  const which = caps.enrichProvider();
  if (which === "apollo") return new ApolloProvider();
  if (which === "hunter") return new HunterProvider();
  return null;
}

export type { EnrichmentProvider, FoundPerson, EmailVerdict, Provenanced } from "./types.js";
