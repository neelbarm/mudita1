# The Seventeen

Every agent drafts; none sends, signs, or bills. Output lands in the
approval queue with a [draft] prefix that only a named human clears.
Every action writes an events row as agent:<slug>. Run any of them:
`sarga agent run <slug>` (add `--dry-run` for the fixture voice).

## Operations (docs/08 canon)

| Agent | Drafts | Gate | Fires |
|---|---|---|---|
| account-researcher | cited account brief | account_brief (accept promotes fact candidates) | sourcing, CLI |
| pain-point-analyst | pain hypotheses with citations | pain_hypotheses (approved rows become signals) | after brief |
| outreach-drafter | one touch from approved facts only | outreach_message, every message | daily queue |
| call-summarizer | structured call notes | call_summary | after calls |
| proposal-drafter | fixed-price proposal | proposal (founder edits, never auto-sends) | after summary |
| brief-preparer | project brief | project_brief | on won |
| reporting-writer | weekly client/studio report | weekly_report | Fri 15:00 |
| stall-watcher | one action per stalled item | stall_action | daily 08:30 |
| automation-scout | automation candidates | automation_candidate | monthly |

## Build factory

| Agent | Drafts | Gate |
|---|---|---|
| designer | full design system + section specs; critic mode scores screenshots | design_spec / feeds build_review |
| builder | one section in the client codebase (cwd-jailed tools, must prove the build) | build_review with screenshots |

## Go-to-market

| Agent | Drafts | Gate |
|---|---|---|
| gtm-strategist | positioning, ICP, messaging, pricing angle, launch strategy | gtm_brief |
| content-writer | essays, landing/social copy, case studies | content_draft; case_study refuses without written client approval |
| distribution-planner | launch checklists + 30-day calendar | distribution_plan |

## Business

| Agent | Drafts | Gate |
|---|---|---|
| finance-analyst | narration of COMPUTED figures only (runner rejects invented numbers) | finance_digest; dunning reminders as invoice_reminder |
| legal-drafter | MSA/SOW/policies/checklists from templates, always stamped "DRAFT for attorney review" | legal_draft; equity memos carry a code-enforced 48h cooling-off |
| strategy-partner | the weekly partner memo; its ICP slice steers sourcing | strategy_memo |

## The six rules (enforced in code, not vibes)

1. Humans approve everything client-facing (the approvals table's
   `decision_requires_human` CHECK, and `sarga approve`).
2. No autonomous sending; no send credentials in any agent. The send
   effector is the only sender and it runs after a named approval.
3. Compliant sources; provenance recorded; opt-outs permanent
   (suppressions table + trigger + code guards at enroll AND send).
4. Cite the source or the claim is discarded (`facts.source_url NOT NULL`).
5. Every action audited (`events.actor` regex-validated against the roster).
6. Everything is a draft until a human clears it (the [draft] prefix
   is forced by `createApproval`).
