import { runAgent } from "../agents/runner.js";
import { getStore } from "../os/store/index.js";
import type { Approval, Json } from "../os/store/types.js";
import { computeFinance } from "./compute.js";

/** Code computes; the Finance Analyst narrates; the queue decides. */
export async function draftFinanceDigest(opts: {
  trigger?: "cli" | "server" | "n8n" | "sim";
  dryRun?: boolean;
} = {}): Promise<Approval | null> {
  const computed = await computeFinance(getStore());
  const { approval } = await runAgent(
    "finance-analyst",
    { computed: computed as unknown as Json },
    {
      trigger: opts.trigger ?? "cli",
      mode: opts.dryRun ? "dry_run" : undefined,
      title: `Finance digest ${computed.as_of}`,
    },
  );
  return approval;
}
