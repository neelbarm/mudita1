import { readFileSync } from "node:fs";
import path from "node:path";
import type { Hono, MiddlewareHandler } from "hono";
import { cfg, STUDIO_ROOT } from "../os/config.js";
import { capabilities } from "../os/capabilities.js";
import { getStore } from "../os/store/index.js";
import { listAgents } from "../agents/registry.js";
import { dueEnrollments } from "../leads/sequence/queue.js";
import { computeFinance } from "../finance/compute.js";
import { sameDay } from "../os/time.js";
import type { AccountStatus } from "../os/store/types.js";

/**
 * Headquarters: the operator's command deck, served by the OS itself
 * at /hq. One aggregate endpoint feeds the whole room so the page
 * stays a single fast poll; the page is a self-contained hand-built
 * HTML file in the studio aesthetic. Works against the local store
 * with zero keys and against Supabase identically.
 */

const ACCOUNT_ORDER: AccountStatus[] = [
  "research", "qualified", "outreach", "conversation", "opportunity", "client", "recycled", "disqualified",
];

export async function buildHqData(): Promise<Record<string, unknown>> {
  const store = getStore();
  const nowIso = new Date().toISOString();

  const [pendingApprovals, events, agentRuns, accounts, projects, buildRuns, stalled, weekly, pipeline, cash, intakeNew, due, touches] =
    await Promise.all([
      store.list("approvals", { where: { status: "pending" }, orderBy: "created_at" }),
      store.list("events", { orderBy: "created_at", ascending: false, limit: 40 }),
      store.list("agent_runs", { orderBy: "created_at", ascending: false }),
      store.list("accounts"),
      store.list("projects"),
      store.list("build_runs", { orderBy: "created_at", ascending: false, limit: 6 }),
      store.view("v_stalled"),
      store.view("v_weekly_metrics"),
      store.view("v_pipeline"),
      store.view("v_cash"),
      store.count("intake_submissions", { where: { status: "new" } }),
      dueEnrollments(),
      store.list("touches", { where: { direction: "outbound" } }),
    ]);

  const finance = await computeFinance(store).catch(() => null);

  // Staff wall: registry joined with each agent's run history.
  const staff = listAgents().map((a) => {
    const runs = agentRuns.filter((r) => r.agent === a.slug);
    const last = runs[0] ?? null;
    return {
      slug: a.slug,
      title: a.title,
      job: a.job,
      gate: a.approvalKind,
      runs: runs.length,
      cost: Math.round(runs.reduce((s, r) => s + Number(r.cost_usd ?? 0), 0) * 100) / 100,
      last: last
        ? { status: last.status, mode: last.mode, at: last.created_at, ms: last.duration_ms }
        : null,
    };
  });

  const leadFlow = ACCOUNT_ORDER.map((status) => ({
    status,
    count: accounts.filter((a) => a.status === status).length,
  }));

  const sendsToday = touches.filter((t) => t.approved_by != null && sameDay(t.created_at, nowIso)).length;

  return {
    operator: cfg.operator,
    now: nowIso,
    store: store.kind,
    capabilities: capabilities(),
    approvals: pendingApprovals.map((a) => ({
      id: a.id,
      kind: a.kind,
      title: a.title,
      summary: a.summary,
      created_at: a.created_at,
      payload: a.payload,
    })),
    events: events.map((e) => ({ at: e.created_at, actor: e.actor, action: e.action, entity: e.entity })),
    staff,
    leadFlow,
    pipeline,
    weekly: weekly[0] ?? {},
    cash: cash[0] ?? {},
    runwayMonths: finance?.runway_months ?? null,
    dunning: finance?.dunning ?? [],
    stalled,
    intakeNew,
    dueCount: due.length,
    sendsToday,
    maxDailySends: cfg.maxDailySends,
    projects: projects.map((p) => ({ id: p.id, offer: p.offer, state: p.state, repo: p.repo_url })),
    buildRuns: buildRuns.map((b) => ({
      slug: b.project_slug, phase: b.phase, section: b.section, status: b.status, at: b.created_at,
    })),
  };
}

export function registerHq(app: Hono, auth: MiddlewareHandler): void {
  app.get("/hq", (c) => {
    const html = readFileSync(path.join(STUDIO_ROOT, "src", "server", "hq.html"), "utf8");
    return c.html(html);
  });
  app.get("/hq/data", auth, async (c) => c.json(await buildHqData()));
}
