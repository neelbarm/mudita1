/** The 17 agent slugs. The registry (src/agents/registry.ts) must cover
 * exactly this set; the events writer validates agent actors against it. */
export const AGENT_SLUGS = [
  "account-researcher",
  "pain-point-analyst",
  "outreach-drafter",
  "call-summarizer",
  "proposal-drafter",
  "brief-preparer",
  "reporting-writer",
  "stall-watcher",
  "automation-scout",
  "designer",
  "builder",
  "gtm-strategist",
  "content-writer",
  "distribution-planner",
  "finance-analyst",
  "legal-drafter",
  "strategy-partner",
] as const;

export type AgentSlug = (typeof AGENT_SLUGS)[number];

export const ICP_QUALIFY_THRESHOLD = 60;
export const MIN_APPROVED_FACTS = 3;
export const STALL_DAYS = 14;
export const PROPOSAL_EXPIRY_DAYS = 21;
export const EQUITY_COOLING_OFF_HOURS = 48;
