import { getStore } from "../../os/store/index.js";
import type { Enrollment } from "../../os/store/types.js";

/**
 * The daily queue (docs/07 step 8): everything is driven by
 * enrollments.next_action_at. Nothing relies on memory.
 */
export async function dueEnrollments(now: Date = new Date()): Promise<Enrollment[]> {
  const store = getStore();
  return store.list("enrollments", {
    where: { state: ["draft", "active"] },
    lte: { next_action_at: now.toISOString() },
    notNull: ["next_action_at"],
    orderBy: "next_action_at",
  });
}
