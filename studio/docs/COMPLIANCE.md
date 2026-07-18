# Compliance: every rule and the code that enforces it

The studio's published posture (sarga-haus/docs/07) is not a page of
good intentions; each rule maps to a code path that refuses. This
file is the index. It is documentation, not legal advice; the studio
retains counsel for that.

| Rule | Where it is enforced |
|---|---|
| No automation sends without human approval | DB: `touches.outbound_requires_approval` CHECK. Code: `enforceInsertInvariants` (both stores), and the only sender is the `outreach_message` effector (`src/leads/sequence/send.ts`), which runs post-approval and re-checks everything. |
| Opt-outs honored immediately and permanently | `suppressions` table (unique lower(email), survives contact deletion), `trg_block_opted_out` DB trigger, `suppress()` one-way door, guards at enroll (`enroll.ts`) AND send (`compliance.ts`). Re-enrollment of a suppressed address throws. |
| Working one-click unsubscribe in every email | `List-Unsubscribe` + `List-Unsubscribe-Post` headers and an HMAC footer link (`mail/resend.ts`), served by `GET /u/:token` which suppresses permanently, no confirmation screens. |
| Accurate sender identity + postal address (CAN-SPAM) | `emailFooter()` appends identity + `STUDIO_POSTAL_ADDRESS`; `assertSendable` REFUSES live sends when the address is unset. |
| Truthful subject lines, no deception | Outreach Drafter prompt bans it; every message is human-read before sending (the gate is the enforcement). |
| Low volume, high specificity | `MAX_DAILY_SENDS` (default 15) enforced in `assertSendable`; quiet hours (`SEND_QUIET_HOURS`) block night sends. |
| Verified addresses only | `assertSendable` refuses anything but `email_status = 'verified'`; verification comes from a licensed provider (`providers/apollo.ts`, `providers/hunter.ts`). |
| Licensed data providers; per-field provenance | `EnrichmentProvider` returns provenance triples stored in `contacts.enrichment`; raw records keep `provider` + `dedupe_key` + source job lineage. |
| No scraping in violation of platform terms | First-party pages and public directories only in scheduled paths. The Maps connector requires an explicit `--i-understand-tos` flag, is excluded from every n8n schedule, and its own header documents the durable alternatives. |
| Hard bounces suppress | `handleBounce` (Resend webhook) marks `bounced` and suppresses permanent failures. |
| Human accept gate before any lead enters the CRM | Sourcing lands only `raw_source_records`; promotion happens exclusively in the `sourcing_batch` effector after approval. |
| Facts must cite sources | `facts.source_url NOT NULL` (DB + store guard); Outreach Drafter receives approved facts only. |
| Case studies publish only with written approval | The `case_study` effector throws without `client_written_approval: true`. |
| Equity needs a cooling-off | Runner stamps `cooling_off_until` (+48h); `decide()` refuses earlier approval. |
| No work before signature and deposit | `sarga project new` refuses without both flags and records them in the event. |
| Finance figures cannot be invented | `assertNoInventedFigures` rejects any digest narrative citing numbers absent from the computed input. |
| Legal drafts are never advice | The runner force-prepends the attorney-review stamp; templates repeat it. |

## Data handling

- Store: Supabase with RLS enabled and no anon policies (service role
  only), or the local JSON file on the operator's machine.
- Deletion requests: `suppress(email, "legal", source)` plus manual
  contact/account deletion; suppressions intentionally survive so the
  address can never be re-imported by accident.
- The events table is append-only history; treat it as the record of
  what the studio actually did, because it is.
