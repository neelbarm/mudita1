import { z } from "zod";

/**
 * Structured output contracts for all 17 agents. The runner validates
 * every engine result against these; live runs also send them to the
 * model as JSON schemas. Change a schema here and the fixtures and
 * prompts must follow.
 */

export const CitedFact = z.object({
  fact: z.string().min(3),
  source_url: z.string().url(),
  source_type: z.string().optional(),
});

export const AccountBrief = z.object({
  account_name: z.string(),
  what_they_do: z.string(),
  how_they_operate: z.string(),
  where_manual_pain_shows: z.string(),
  suggested_segment: z.enum(["founder", "creator", "consultant", "coach", "agency", "service_business"]),
  facts: z.array(CitedFact).min(1),
  open_questions: z.array(z.string()).default([]),
});

export const PainHypotheses = z.object({
  hypotheses: z
    .array(
      z.object({
        hypothesis: z.string(),
        evidence: z.array(CitedFact).min(1),
        confidence: z.enum(["low", "medium", "high"]),
        signal_type: z
          .enum(["hiring", "launch", "funding", "content", "tooling_gap", "manual_workflow_evidence"])
          .optional(),
      }),
    )
    .min(1),
});

export const OutreachDraft = z.object({
  channel: z.enum(["email", "linkedin"]),
  subject: z.string().max(120).optional(),
  body: z.string().min(20),
  facts_used: z.array(z.string()).min(1),
  step_day: z.number().int().min(0),
  tone_note: z.string().optional(),
});

export const CallSummary = z.object({
  situation: z.string(),
  goals: z.array(z.string()).min(1),
  constraints: z.array(z.string()).default([]),
  budget_signals: z.array(z.string()).default([]),
  next_steps: z.array(z.string()).min(1),
  notable_quotes: z.array(z.string()).default([]),
});

export const ProposalDraft = z.object({
  title: z.string(),
  situation: z.string(),
  proposed_system: z.string(),
  scope: z.array(z.string()).min(1),
  out_of_scope: z.array(z.string()).min(1),
  timeline_weeks: z.number().min(1).max(12),
  price_usd: z.number().positive(),
  payment_terms: z.string(),
  assumptions: z.array(z.string()).default([]),
  expiry_days: z.number().int().default(21),
});

export const ProjectBrief = z.object({
  project_name: z.string(),
  objective: z.string(),
  scope: z.array(z.string()).min(1),
  milestones: z.array(z.object({ name: z.string(), week: z.number().int().min(1), deliverable: z.string() })).min(1),
  access_checklist: z.array(z.string()).min(1),
  risks: z.array(z.string()).default([]),
});

export const WeeklyReport = z.object({
  week_of: z.string(),
  shipped: z.array(z.string()),
  next: z.array(z.string()),
  blocked: z.array(z.string()),
  decisions_needed: z.array(z.string()),
  metrics_note: z.string(),
});

export const StallActions = z.object({
  items: z
    .array(
      z.object({
        kind: z.enum(["enrollment", "opportunity", "project"]),
        id: z.string(),
        why_stalled: z.string(),
        suggested_action: z.string(),
      }),
    )
    .default([]),
});

export const AutomationCandidates = z.object({
  candidates: z
    .array(
      z.object({
        workflow: z.string(),
        pain: z.string(),
        automation: z.string(),
        effort: z.enum(["low", "medium", "high"]),
        impact: z.enum(["low", "medium", "high"]),
        first_step: z.string(),
      }),
    )
    .min(1),
});

// ------------------------------------------------------------- factory ----

export const DesignSpec = z.object({
  brand: z.object({
    name: z.string(),
    adjectives: z.array(z.string()).min(3).max(6),
    voice: z.string(),
    audience: z.string(),
  }),
  tokens: z.object({
    grounds: z.array(z.object({ name: z.string(), value: z.string(), on: z.string() })).min(1).max(2),
    accent: z.object({ name: z.string(), value: z.string(), rule: z.string() }),
    neutrals: z.array(z.object({ name: z.string(), value: z.string(), role: z.string() })).min(2),
  }),
  type_system: z.object({
    display_font: z.string(),
    text_font: z.string(),
    scale: z.array(z.object({ name: z.string(), size: z.string(), weight: z.number() })).min(3),
  }),
  motion: z.object({
    easing: z.string(),
    duration_range: z.string(),
    principles: z.array(z.string()).min(2),
  }),
  sections: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        intent: z.string(),
        layout: z.string(),
        content_notes: z.string(),
        signature_interaction: z.string().optional(),
      }),
    )
    .min(3),
  signature_moment: z.object({ section: z.string(), description: z.string() }),
});

export const DesignCritique = z.object({
  scores: z.object({
    hierarchy: z.number().min(0).max(5),
    typography: z.number().min(0).max(5),
    color_restraint: z.number().min(0).max(5),
    spacing_rhythm: z.number().min(0).max(5),
    motion_purpose: z.number().min(0).max(5),
    responsiveness: z.number().min(0).max(5),
    accessibility: z.number().min(0).max(5),
    brand_fidelity: z.number().min(0).max(5),
  }),
  average: z.number().min(0).max(5),
  verdict: z.enum(["pass", "iterate"]),
  notes: z.array(z.string()).min(1),
  worst_dimension: z.string(),
});

export const BuildResult = z.object({
  section: z.string(),
  files_touched: z.array(z.string()).min(1),
  summary: z.string(),
  how_to_verify: z.string(),
});

// ----------------------------------------------------------------- gtm ----

export const GtmBrief = z.object({
  subject: z.string(),
  positioning: z.object({
    audience: z.string(),
    problem: z.string(),
    product_is: z.string(),
    unlike: z.string(),
    proof_points: z.array(z.string()).min(1),
  }),
  icp: z.object({
    segments: z.array(z.string()).min(1),
    firmographics: z.string(),
    watering_holes: z.array(z.string()).min(1),
  }),
  messaging: z.object({
    headline: z.string(),
    subhead: z.string(),
    pillars: z.array(z.object({ claim: z.string(), support: z.string() })).min(2),
  }),
  pricing_angle: z.string(),
  launch_strategy: z.array(z.string()).min(2),
});

export const ContentDraft = z.object({
  kind: z.enum(["essay", "landing", "social", "case_study"]),
  title: z.string(),
  body_markdown: z.string().min(50),
  channel: z.string().optional(),
  client_written_approval: z.boolean().optional(),
});

export const DistributionPlan = z.object({
  launch_checklists: z
    .array(z.object({ channel: z.string(), steps: z.array(z.string()).min(2) }))
    .min(2),
  calendar: z.array(z.object({ day: z.number().int().min(0), channel: z.string(), action: z.string() })).min(5),
  communities: z.array(z.string()).default([]),
});

// ------------------------------------------------------------ business ----

export const FinanceDigest = z.object({
  narrative: z.string().min(40),
  health: z.enum(["good", "watch", "tight"]),
  figures_used: z.array(z.object({ label: z.string(), value: z.number() })).min(1),
  recommendations: z.array(z.string()).min(1),
});

export const InvoiceReminder = z.object({
  invoice_ref: z.string(),
  days_overdue: z.number().int(),
  subject: z.string(),
  body: z.string().min(20),
  escalation: z.enum(["gentle", "firm"]),
});

export const LegalDraft = z.object({
  doc_type: z.enum(["msa", "sow", "privacy_policy", "tos", "dpa_checklist", "equity_memo", "contract_review"]),
  title: z.string(),
  body_markdown: z.string().min(100),
  placeholders_remaining: z.array(z.string()).default([]),
});

export const StrategyMemo = z.object({
  tldr: z.string(),
  pipeline_read: z.string(),
  kill: z.array(z.string()).default([]),
  double_down: z.array(z.string()).min(1),
  pricing_counsel: z.string(),
  icp_slice: z.object({
    segment: z.enum(["founder", "creator", "consultant", "coach", "agency", "service_business"]),
    geo: z.string().optional(),
    size: z.string().optional(),
    notes: z.string(),
  }),
  risks: z.array(z.string()).min(1),
  next_week_focus: z.array(z.string()).min(1),
});

export type AgentOutputSchema = z.ZodTypeAny;
