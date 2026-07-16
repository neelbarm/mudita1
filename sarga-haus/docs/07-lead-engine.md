# Sarga Haus — Lead Engine

The internal system that the Pipeline Sprint productizes for clients. It is
infrastructure and process, never a volume promise.

## Pipeline of operations

1. **Target account research** — quarterly ICP slice; agent-drafted account
   briefs from compliant public sources; human accept/reject gate.
2. **Contact enrichment** — licensed enrichment provider; email verification;
   provenance recorded per field.
3. **ICP scoring** — 0–100 rubric (docs/06 §5); ≥60 qualifies; overrides logged.
4. **Pain-point identification** — signals table: hiring posts, tool churn,
   manual-workflow evidence, launch activity. Each signal cites its source URL.
5. **Personalization data** — 3 usable facts per contact minimum before any
   draft is written; facts must be public and professional.
6. **Outreach readiness** — a contact is ready only with: verified email, ICP ≥
   60, ≥3 facts, no suppression, sequence assigned.
7. **CRM sync** — enrollments and touches write through to opportunities;
   nothing sent outside the system of record.
8. **Follow-up status** — `next_action_at` drives a daily queue; nothing relies
   on memory.
9. **Reply classification** — agent-suggested class, human-confirmed;
   interested replies get a same-day human response.
10. **Opportunity tracking** — conversation → discovery → proposal →
    negotiation → won/lost with value, probability, next step, due date.
11. **Reporting dashboard** — weekly: accounts researched, qualified, contacted
    (approved sends only), reply rate, conversations, opportunities, pipeline
    value. Reviewed every Friday; sequences that underperform for two weeks are
    rewritten or retired.

## Compliance posture (non-negotiable)

- Lawful basis and applicable law respected per region (CAN-SPAM, GDPR/PECR
  where relevant): accurate sender identity, truthful subject lines, physical
  address, working unsubscribe honored immediately and permanently.
- No scraping in violation of platform terms; licensed data providers only.
- Suppression list is permanent and checked before every enrollment.
- Low volume, high specificity. No automation sends without human approval.
