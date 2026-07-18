import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { dir } from "../os/config.js";
import { createApproval } from "../os/approvals.js";
import { getStore } from "../os/store/index.js";
import type { Approval } from "../os/store/types.js";

/**
 * The launch checklist (docs/06 §12), generated from the build's real
 * state and queued for the human. Approving it is the go decision;
 * the deploy itself stays in human hands.
 */
export async function generateLaunchChecklist(slug: string): Promise<Approval> {
  const store = getStore();
  const clientDir = path.join(dir.clients, slug);
  const screens = path.join(clientDir, "qa", "screens");
  const shotCount = existsSync(screens) ? readdirSync(screens).filter((f) => f.endsWith(".png")).length : 0;
  const buildRuns = await store.list("build_runs", { where: { project_slug: slug } });
  const approvedSections = buildRuns.filter((b) => b.phase === "build" && b.status === "approved").map((b) => b.section);
  const passedSections = buildRuns.filter((b) => b.phase === "build" && ["passed", "approved"].includes(b.status)).map((b) => b.section);

  const md = `# Launch checklist: ${slug}

Generated ${new Date().toISOString().slice(0, 10)}. Approving this checklist is the go decision; a human runs the deploy.

## Built and reviewed
- Sections built: ${passedSections.join(", ") || "none"}
- Sections human-approved: ${approvedSections.join(", ") || "none yet"}
- Screenshots on file: ${shotCount}

## Functional
- [ ] Every flow in the spec walks end to end on production build
- [ ] Forms submit, validate, and fail gracefully offline
- [ ] Payment flow tested with a live-mode $1 transaction, then refunded (when Stripe is in scope)

## Mobile
- [ ] Phone layouts recomposed, not shrunk (see qa/screens/*-phone.png)
- [ ] Tap targets at least 44px; nothing overflows

## Accessibility
- [ ] npm run qa passes the axe gate (no serious/critical)
- [ ] Keyboard-only walkthrough completed
- [ ] Reduced-motion rendering checked

## Performance
- [ ] npm run qa passes LCP < 2.5s on throttled 4G
- [ ] Images sized and lazy where offscreen

## Operations
- [ ] Error monitoring wired (Sentry DSN) or consciously deferred
- [ ] Analytics firing (Plausible) or consciously deferred
- [ ] Database backups confirmed on the client's Supabase plan
- [ ] Rollback: previous deploy restorable in one step

## Legal
- [ ] Privacy policy and ToS pages published (Legal Drafter output, attorney reviewed)
- [ ] Cookie/consent posture matches what the site actually does

## Handoff (docs/06 §12)
- [ ] Client accounts own domain, repo, database, Stripe
- [ ] Handoff doc + walkthrough video recorded
- [ ] 7-day watch window scheduled
`;

  writeFileSync(path.join(clientDir, "LAUNCH.md"), md);

  return createApproval({
    kind: "launch_checklist",
    title: `Launch checklist: ${slug}`,
    summary: `${passedSections.length} sections built, ${approvedSections.length} approved, ${shotCount} screenshots`,
    payload: { slug, checklist_path: path.join("clients", slug, "LAUNCH.md"), sections_built: passedSections },
    entity: "project",
  });
}
