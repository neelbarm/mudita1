/**
 * Row types for the system of record: the 11 core tables from
 * sarga-haus/supabase/schema.sql plus the 10 studio tables from
 * db/migrations/001_studio.sql. Timestamps are ISO strings; jsonb is
 * typed loosely and validated at the edges with zod.
 */

export type Json = Record<string, unknown>;

interface Base {
  id: string;
  created_at: string;
}
interface Tracked extends Base {
  updated_at: string;
}

// ------------------------------------------------------------- core 11 ----

export interface IntakeSubmission extends Tracked {
  name: string;
  email: string;
  company: string | null;
  link: string | null;
  building: string;
  broken: string | null;
  impact: string | null;
  category: "product" | "automation" | "pipeline" | "combination";
  timeline: "now" | "quarter" | "exploring" | null;
  budget: "under_10k" | "10k_25k" | "25k_60k" | "60k_plus" | "unsure" | null;
  tools: string | null;
  notes: string | null;
  status: "new" | "reviewed" | "call_booked" | "proposal" | "won" | "lost" | "disqualified";
  source: string | null;
  user_agent: string | null;
}

export type AccountStatus =
  | "research" | "qualified" | "outreach" | "conversation"
  | "opportunity" | "client" | "recycled" | "disqualified";
export type Segment = "founder" | "creator" | "consultant" | "coach" | "agency" | "service_business";

export interface Account extends Tracked {
  name: string;
  domain: string | null;
  segment: Segment | null;
  size: string | null;
  geo: string | null;
  source: string | null;
  icp_score: number | null;
  icp_notes: string | null;
  status: AccountStatus;
}

export interface Contact extends Tracked {
  account_id: string;
  full_name: string;
  role: string | null;
  email: string | null;
  linkedin_url: string | null;
  email_status: "unverified" | "verified" | "bounced" | "opted_out";
  enrichment: Json;
  opted_out_at: string | null;
}

export type SignalType = "hiring" | "launch" | "funding" | "content" | "tooling_gap" | "manual_workflow_evidence";

export interface Signal extends Base {
  account_id: string;
  type: SignalType;
  detail: string;
  observed_at: string | null;
  url: string | null;
}

export interface Sequence extends Base {
  name: string;
  channel_mix: string | null;
  status: "draft" | "active" | "retired";
}

export interface SequenceStep {
  id: string;
  sequence_id: string;
  day_offset: number;
  channel: "email" | "linkedin" | "call";
  template: string | null;
  requires_human_approval: boolean;
}

export type EnrollmentState =
  | "draft" | "pending_approval" | "active" | "replied" | "paused" | "finished" | "opted_out";

export interface Enrollment extends Tracked {
  contact_id: string;
  sequence_id: string;
  current_step: number;
  state: EnrollmentState;
  next_action_at: string | null;
}

export type ReplyClass = "interested" | "question" | "later" | "referral" | "negative" | "opt_out" | "auto";

export interface Touch extends Base {
  enrollment_id: string;
  direction: "outbound" | "inbound";
  channel: "email" | "linkedin" | "call";
  body: string | null;
  approved_by: string | null;
  reply_class: ReplyClass | null;
}

export type Offer = "validation" | "build" | "automation" | "pipeline" | "growth";
export type OpportunityStage = "discovery" | "proposal" | "negotiation" | "won" | "lost";

export interface Opportunity extends Tracked {
  account_id: string | null;
  intake_id: string | null;
  offer: Offer;
  stage: OpportunityStage;
  value_estimate: number | null;
  probability: number | null;
  next_step: string | null;
  next_step_due: string | null;
  lost_reason: string | null;
}

export interface Project extends Tracked {
  opportunity_id: string;
  offer: string;
  state: "onboarding" | "in_build" | "qa" | "launched" | "retainer" | "closed";
  start_date: string | null;
  target_ship_date: string | null;
  repo_url: string | null;
  weekly_update_day: string | null;
}

export interface EventRow extends Base {
  entity: string;
  entity_id: string;
  actor: string;
  action: string;
  detail: Json;
}

// ------------------------------------------------------------ studio 10 ----

export type AgentRunMode = "live" | "dry_run";

export interface AgentRun extends Tracked {
  agent: string;
  mode: AgentRunMode;
  status: "running" | "succeeded" | "failed";
  trigger: "cli" | "server" | "n8n" | "sim";
  input: Json;
  output: Json | null;
  error: string | null;
  model: string | null;
  num_turns: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  duration_ms: number | null;
  transcript_path: string | null;
  entity: string | null;
  entity_id: string | null;
}

export type ApprovalKind =
  | "account_brief" | "pain_hypotheses" | "outreach_message" | "reply_class" | "icp_override"
  | "call_summary" | "proposal" | "project_brief" | "weekly_report" | "stall_action"
  | "automation_candidate" | "sourcing_batch"
  | "design_spec" | "build_review" | "launch_checklist"
  | "gtm_brief" | "content_draft" | "distribution_plan" | "case_study"
  | "finance_digest" | "invoice_reminder" | "legal_draft" | "strategy_memo";

export interface Approval extends Tracked {
  kind: ApprovalKind;
  title: string;
  summary: string | null;
  payload: Json;
  agent_run_id: string | null;
  entity: string | null;
  entity_id: string | null;
  status: "pending" | "approved" | "rejected" | "expired";
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string | null;
  edited_payload: Json | null;
  expires_at: string | null;
}

export interface Fact extends Tracked {
  account_id: string;
  contact_id: string | null;
  fact: string;
  source_url: string;
  source_type: string | null;
  observed_at: string | null;
  status: "candidate" | "approved" | "rejected" | "stale";
  approved_by: string | null;
  used_in_touch_id: string | null;
}

export interface Suppression extends Base {
  email: string;
  domain: string | null;
  reason: "opt_out" | "hard_bounce" | "manual" | "legal";
  source: string | null;
  note: string | null;
}

export type SourceJobKind =
  | "maps_scrape" | "directory_crawl" | "site_signal_crawl"
  | "apollo_search" | "hunter_domain_search" | "csv_import";

export interface SourceJob extends Tracked {
  kind: SourceJobKind;
  query: Json;
  provider: string | null;
  status: "running" | "succeeded" | "failed";
  stats: Json;
  error: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface RawSourceRecord extends Base {
  source_job_id: string | null;
  provider: string;
  external_id: string | null;
  url: string | null;
  kind: "company" | "person" | "signal";
  raw: Json;
  dedupe_key: string | null;
  normalized_at: string | null;
  account_id: string | null;
  contact_id: string | null;
}

export interface Brief extends Tracked {
  opportunity_id: string | null;
  project_id: string | null;
  content: Json;
  status: "draft" | "approved";
  approved_by: string | null;
  approved_at: string | null;
}

export interface DesignSpec extends Tracked {
  brief_id: string | null;
  version: number;
  tokens: Json;
  type_system: Json;
  motion: Json;
  sections: unknown[];
  rubric_scores: Json | null;
  status: "draft" | "approved";
}

export interface BuildRun extends Tracked {
  project_slug: string;
  brief_id: string | null;
  design_spec_id: string | null;
  phase: "scaffold" | "tokens" | "build" | "qa" | "review" | "launch";
  section: string | null;
  iteration: number;
  status: "running" | "passed" | "failed" | "approved";
  screenshot_paths: string[];
  critique: Json | null;
  scores: Json | null;
}

export interface LedgerEntry extends Tracked {
  entry_date: string;
  kind: "invoice" | "payment" | "expense" | "refund" | "credit";
  amount: number;
  currency: string;
  project_id: string | null;
  opportunity_id: string | null;
  external_id: string | null;
  source: "stripe" | "csv" | "manual";
  status: "open" | "paid" | "void" | "overdue";
  due_date: string | null;
  counterparty: string | null;
  memo: string | null;
}

// ---------------------------------------------------------------- tables ----

export interface Tables {
  intake_submissions: IntakeSubmission;
  accounts: Account;
  contacts: Contact;
  signals: Signal;
  sequences: Sequence;
  sequence_steps: SequenceStep;
  enrollments: Enrollment;
  touches: Touch;
  opportunities: Opportunity;
  projects: Project;
  events: EventRow;
  agent_runs: AgentRun;
  approvals: Approval;
  facts: Fact;
  suppressions: Suppression;
  source_jobs: SourceJob;
  raw_source_records: RawSourceRecord;
  briefs: Brief;
  design_specs: DesignSpec;
  build_runs: BuildRun;
  ledger_entries: LedgerEntry;
}

export type TableName = keyof Tables;
export type Row<T extends TableName> = Tables[T];

export const VIEW_NAMES = [
  "v_pipeline",
  "v_lead_flow",
  "v_intake_quality",
  "v_stalled",
  "v_approval_queue",
  "v_outreach_ready",
  "v_weekly_metrics",
  "v_cash",
] as const;
export type ViewName = (typeof VIEW_NAMES)[number];
