import { runAgent } from "../agents/runner.js";
import { getStore } from "../os/store/index.js";
import type { Approval, Json } from "../os/store/types.js";

/**
 * The weekly report (docs/07 step 11): metrics come from the view
 * (contacted counts approved sends only), the Reporting Writer
 * narrates them, and the draft waits in the queue for Friday review.
 */
export async function draftWeeklyReport(opts: {
  shipped?: string[];
  trigger?: "cli" | "server" | "n8n" | "sim";
  dryRun?: boolean;
} = {}): Promise<Approval | null> {
  const store = getStore();
  const [metrics] = await store.view("v_weekly_metrics");
  const weekOf = new Date().toISOString().slice(0, 10);
  const { approval } = await runAgent(
    "reporting-writer",
    {
      week_of: weekOf,
      metrics: (metrics ?? {}) as Json,
      shipped: opts.shipped ?? [],
    },
    {
      trigger: opts.trigger ?? "cli",
      mode: opts.dryRun ? "dry_run" : undefined,
      title: `Weekly report, week of ${weekOf}`,
    },
  );
  return approval;
}
