# Sarga Haus — Agentic Layer

Human-supervised agents that remove drudgery and keep judgment human. Every
agent writes to the approval queue; none has send/sign/bill authority.

## Agents

| Agent | Does | Human gate |
|---|---|---|
| Account Researcher | Drafts account briefs from compliant public sources: what the business does, how it likely operates, where manual workflow pain shows | Accept/reject brief |
| Pain-Point Analyst | Extracts candidate pain hypotheses + supporting signals with citations | Confirm before use in outreach |
| Outreach Drafter | Drafts personalized first-touch and follow-ups from approved facts only | Every message approved before send |
| Call Summarizer | Turns discovery-call transcripts into structured notes: situation, goals, constraints, budget signals, next steps | Founder reviews before entering CRM |
| Proposal Drafter | Assembles proposal draft from call summary + template | Founder edits and approves; nothing auto-sends |
| Brief Preparer | Converts a won proposal into a project brief: scope, milestones, access checklist | Reviewed at kickoff |
| Reporting Writer | Drafts weekly client update from commit logs, shipped items, metrics | Founder approves before send |
| Stall Watcher | Flags enrollments/opportunities/projects idle ≥14 days with suggested next action | Human decides the action |
| Automation Scout | Reviews client workflows and studio ops for automation candidates with effort/impact notes | Founder prioritizes |

## Rules

1. Humans approve all client-facing messages, proposals, contracts, billing,
   strategy decisions, and any claim about results.
2. No autonomous cold email. No agent has credentials to send anything.
3. Data sources must be compliant: platform terms, consent, privacy law.
   Provenance is recorded; opt-outs are permanent.
4. Agents cite sources for every factual claim; uncited claims are discarded.
5. Every agent action writes an `events` row (actor `agent:<name>`), so the
   audit trail is complete.
6. Agent output is a draft by definition. The word "draft" appears in every
   queue item until a human clears it.
