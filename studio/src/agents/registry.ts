import type { AgentSlug } from "../os/constants.js";
import { AGENT_SLUGS } from "../os/constants.js";
import type { ApprovalKind } from "../os/store/types.js";
import type { AgentOutputSchema } from "./schemas.js";
import * as S from "./schemas.js";

/**
 * The agent registry: 17 agents, one harness. Every agent here is
 * draft-only. None has send, sign, or bill authority; output lands in
 * the approval queue and a human clears it or it goes nowhere.
 */

export interface AgentDef {
  slug: AgentSlug;
  title: string;
  /** one-line job description shown in `sarga agent list` */
  job: string;
  promptPath: string;
  skillPaths: string[];
  /** SDK tool names for live runs; [] = pure text agent */
  tools: string[];
  maxTurns: number;
  outputSchema: AgentOutputSchema;
  approvalKind: ApprovalKind | null;
  entity: string;
}

const def = (d: AgentDef): AgentDef => d;

export const REGISTRY: Record<AgentSlug, AgentDef> = {
  "account-researcher": def({
    slug: "account-researcher",
    title: "Account Researcher",
    job: "Turns raw source records into a cited account brief: what the business does, how it operates, where manual pain shows.",
    promptPath: "account-researcher.md",
    skillPaths: [],
    tools: [],
    maxTurns: 4,
    outputSchema: S.AccountBrief,
    approvalKind: "account_brief",
    entity: "account",
  }),
  "pain-point-analyst": def({
    slug: "pain-point-analyst",
    title: "Pain-Point Analyst",
    job: "Reads signals and facts, produces pain hypotheses with citations. No citation, no claim.",
    promptPath: "pain-point-analyst.md",
    skillPaths: [],
    tools: [],
    maxTurns: 4,
    outputSchema: S.PainHypotheses,
    approvalKind: "pain_hypotheses",
    entity: "account",
  }),
  "outreach-drafter": def({
    slug: "outreach-drafter",
    title: "Outreach Drafter",
    job: "Drafts one outreach touch from approved facts only. Every message goes to the queue; nothing sends itself.",
    promptPath: "outreach-drafter.md",
    skillPaths: [],
    tools: [],
    maxTurns: 4,
    outputSchema: S.OutreachDraft,
    approvalKind: "outreach_message",
    entity: "enrollment",
  }),
  "call-summarizer": def({
    slug: "call-summarizer",
    title: "Call Summarizer",
    job: "Turns a discovery call transcript into structured notes: situation, goals, constraints, budget signals, next steps.",
    promptPath: "call-summarizer.md",
    skillPaths: [],
    tools: ["Read"],
    maxTurns: 6,
    outputSchema: S.CallSummary,
    approvalKind: "call_summary",
    entity: "opportunity",
  }),
  "proposal-drafter": def({
    slug: "proposal-drafter",
    title: "Proposal Drafter",
    job: "Drafts a fixed-price proposal from the approved call summary. The founder edits and approves; it never sends itself.",
    promptPath: "proposal-drafter.md",
    skillPaths: [],
    tools: [],
    maxTurns: 4,
    outputSchema: S.ProposalDraft,
    approvalKind: "proposal",
    entity: "opportunity",
  }),
  "brief-preparer": def({
    slug: "brief-preparer",
    title: "Brief Preparer",
    job: "Turns a won proposal into a project brief: scope, milestones, access checklist. Reviewed at kickoff.",
    promptPath: "brief-preparer.md",
    skillPaths: [],
    tools: [],
    maxTurns: 4,
    outputSchema: S.ProjectBrief,
    approvalKind: "project_brief",
    entity: "project",
  }),
  "reporting-writer": def({
    slug: "reporting-writer",
    title: "Reporting Writer",
    job: "Writes the weekly client update and the studio weekly report from computed metrics and shipped items.",
    promptPath: "reporting-writer.md",
    skillPaths: [],
    tools: [],
    maxTurns: 4,
    outputSchema: S.WeeklyReport,
    approvalKind: "weekly_report",
    entity: "project",
  }),
  "stall-watcher": def({
    slug: "stall-watcher",
    title: "Stall Watcher",
    job: "Reads v_stalled and suggests one concrete next action per idle item. The human decides.",
    promptPath: "stall-watcher.md",
    skillPaths: [],
    tools: [],
    maxTurns: 3,
    outputSchema: S.StallActions,
    approvalKind: "stall_action",
    entity: "pipeline",
  }),
  "automation-scout": def({
    slug: "automation-scout",
    title: "Automation Scout",
    job: "Scans studio and client workflows for automation candidates with effort and impact estimates.",
    promptPath: "automation-scout.md",
    skillPaths: [],
    tools: [],
    maxTurns: 4,
    outputSchema: S.AutomationCandidates,
    approvalKind: "automation_candidate",
    entity: "studio",
  }),
  designer: def({
    slug: "designer",
    title: "Designer",
    job: "Turns a brief and brand interview into a full design spec: tokens, type, motion, per-section specs, one signature moment per page.",
    promptPath: "designer.md",
    skillPaths: [
      "design/01-method.md",
      "design/02-craft-rubric.md",
      "design/03-token-schema.md",
      "design/04-section-spec.md",
      "design/05-motion-language.md",
    ],
    tools: ["Read"],
    maxTurns: 8,
    outputSchema: S.DesignSpec,
    approvalKind: "design_spec",
    entity: "design_spec",
  }),
  builder: def({
    slug: "builder",
    title: "Builder",
    job: "Implements one approved section spec in the client codebase, builds it, and reports what to verify.",
    promptPath: "builder.md",
    skillPaths: ["design/02-craft-rubric.md", "design/05-motion-language.md"],
    tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
    maxTurns: 40,
    outputSchema: S.BuildResult,
    approvalKind: "build_review",
    entity: "build_run",
  }),
  "gtm-strategist": def({
    slug: "gtm-strategist",
    title: "GTM Strategist",
    job: "Positioning, ICP, messaging hierarchy, pricing angle, and launch strategy for a client MVP or the studio itself.",
    promptPath: "gtm-strategist.md",
    skillPaths: ["gtm/positioning-method.md"],
    tools: [],
    maxTurns: 4,
    outputSchema: S.GtmBrief,
    approvalKind: "gtm_brief",
    entity: "gtm",
  }),
  "content-writer": def({
    slug: "content-writer",
    title: "Content Writer",
    job: "Journal essays, landing and social copy, case-study drafts. Case studies publish only with written client approval.",
    promptPath: "content-writer.md",
    skillPaths: ["gtm/positioning-method.md"],
    tools: [],
    maxTurns: 4,
    outputSchema: S.ContentDraft,
    approvalKind: "content_draft",
    entity: "gtm",
  }),
  "distribution-planner": def({
    slug: "distribution-planner",
    title: "Distribution Planner",
    job: "Launch checklists (Product Hunt, HN, directories, communities) and a 30-day post-launch distribution calendar.",
    promptPath: "distribution-planner.md",
    skillPaths: ["gtm/launch-channels.md"],
    tools: [],
    maxTurns: 4,
    outputSchema: S.DistributionPlan,
    approvalKind: "distribution_plan",
    entity: "gtm",
  }),
  "finance-analyst": def({
    slug: "finance-analyst",
    title: "Finance Analyst",
    job: "Narrates the computed finance picture: unit economics, cash, P&L, runway, dunning. Code computes; this agent explains.",
    promptPath: "finance-analyst.md",
    skillPaths: ["finance/unit-economics-method.md"],
    tools: [],
    maxTurns: 4,
    outputSchema: S.FinanceDigest,
    approvalKind: "finance_digest",
    entity: "finance",
  }),
  "legal-drafter": def({
    slug: "legal-drafter",
    title: "Legal Drafter",
    job: "Assembles MSA/SOW/policies/checklists from studio templates. Every output is a draft for attorney review, never legal advice.",
    promptPath: "legal-drafter.md",
    skillPaths: [],
    tools: ["Read"],
    maxTurns: 6,
    outputSchema: S.LegalDraft,
    approvalKind: "legal_draft",
    entity: "legal",
  }),
  "strategy-partner": def({
    slug: "strategy-partner",
    title: "Strategy Partner",
    job: "The weekly partner meeting in memo form: kill or double down, pricing counsel, the quarterly ICP slice, risk flags.",
    promptPath: "strategy-partner.md",
    skillPaths: [],
    tools: [],
    maxTurns: 4,
    outputSchema: S.StrategyMemo,
    approvalKind: "strategy_memo",
    entity: "studio",
  }),
};

export function getAgent(slug: string): AgentDef {
  const d = (REGISTRY as Record<string, AgentDef>)[slug];
  if (!d) throw new Error(`unknown agent "${slug}". Known: ${AGENT_SLUGS.join(", ")}`);
  return d;
}

export function listAgents(): AgentDef[] {
  return AGENT_SLUGS.map((s) => REGISTRY[s]);
}
