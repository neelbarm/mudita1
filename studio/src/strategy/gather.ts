import { runAgent } from "../agents/runner.js";
import { getStore } from "../os/store/index.js";
import { computeFinance } from "../finance/compute.js";
import type { Approval, Json } from "../os/store/types.js";

/**
 * The Strategy Partner's briefing pack: pipeline views, weekly
 * metrics, the stalled list, and the computed finance picture. The
 * memo it produces closes the loop: an approved icp_slice becomes the
 * sourcing target (written by the strategy_memo effector).
 */
export async function gatherStrategyInput(): Promise<Json> {
  const store = getStore();
  const [pipeline, weekly, stalled] = await Promise.all([
    store.view("v_pipeline"),
    store.view("v_weekly_metrics"),
    store.view("v_stalled"),
  ]);
  const finance = await computeFinance(store);
  const recentLost = await store.list("opportunities", { where: { stage: "lost" }, orderBy: "updated_at", ascending: false, limit: 5 });
  return {
    pipeline,
    weekly_metrics: weekly[0] ?? {},
    stalled,
    finance: {
      health_inputs: finance.cash,
      runway_months: finance.runway_months,
      pnl_month: finance.pnl_month,
    },
    recent_lost: recentLost.map((o) => ({ offer: o.offer, value: o.value_estimate, reason: o.lost_reason })),
  };
}

export async function draftStrategyMemo(opts: {
  trigger?: "cli" | "server" | "n8n" | "sim";
  dryRun?: boolean;
} = {}): Promise<Approval | null> {
  const input = await gatherStrategyInput();
  const { approval } = await runAgent("strategy-partner", input, {
    trigger: opts.trigger ?? "cli",
    mode: opts.dryRun ? "dry_run" : undefined,
    title: `Partner memo, week of ${new Date().toISOString().slice(0, 10)}`,
  });
  return approval;
}
