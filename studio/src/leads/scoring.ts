import { ICP_QUALIFY_THRESHOLD } from "../os/constants.js";
import type { SignalType } from "../os/store/types.js";

/**
 * The ICP rubric from docs/06 §5, as a deterministic function:
 *   segment fit 25 · pain evidence 25 · budget plausibility 20 ·
 *   reachability 15 · timing 15. Score >= 60 qualifies.
 * Agents may argue about inputs; they never touch the arithmetic.
 * Overrides happen only through the logged icp_override path.
 */

export interface ScoreInput {
  /** Does the account match the current ICP slice? Caller decides from the strategy slice. */
  segmentFit: "core" | "adjacent" | "none";
  signalTypes: SignalType[];
  /** Team size when known. */
  teamSize?: number | null;
  /** Explicit budget hint when a source supports it. */
  revenueHint?: "low" | "mid" | "high" | null;
  emailStatus: "unverified" | "verified" | "bounced" | "opted_out" | null;
  hasLinkedin: boolean;
  /** Days since the freshest signal; null = no dated signal. */
  freshestSignalDays: number | null;
}

export interface ScoreBreakdown {
  segment_fit: number;
  pain_evidence: number;
  budget_plausibility: number;
  reachability: number;
  timing: number;
  total: number;
  qualifies: boolean;
}

const STRONG_PAIN: SignalType[] = ["manual_workflow_evidence", "tooling_gap"];

export function scoreIcp(input: ScoreInput): ScoreBreakdown {
  const segment_fit = input.segmentFit === "core" ? 25 : input.segmentFit === "adjacent" ? 15 : 0;

  let pain = 0;
  for (const t of input.signalTypes) {
    pain += STRONG_PAIN.includes(t) ? 15 : 5;
  }
  const pain_evidence = Math.min(25, pain);

  let budget = 5;
  if (input.revenueHint === "high") budget = 20;
  else if (input.revenueHint === "mid") budget = 12;
  else if (input.revenueHint === "low") budget = 5;
  else if (input.teamSize != null) {
    budget = input.teamSize >= 5 ? 15 : input.teamSize >= 2 ? 10 : 5;
  }
  const budget_plausibility = Math.min(20, budget);

  let reach = 0;
  if (input.emailStatus === "verified") reach += 10;
  else if (input.emailStatus === "unverified") reach += 5;
  if (input.hasLinkedin) reach += 5;
  const reachability = Math.min(15, reach);

  const d = input.freshestSignalDays;
  const timing = d == null ? 0 : d <= 30 ? 15 : d <= 90 ? 10 : d <= 180 ? 5 : 0;

  const total = segment_fit + pain_evidence + budget_plausibility + reachability + timing;
  return {
    segment_fit,
    pain_evidence,
    budget_plausibility,
    reachability,
    timing,
    total,
    qualifies: total >= ICP_QUALIFY_THRESHOLD,
  };
}
