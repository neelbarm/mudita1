/**
 * The single effector registration point. Importing this module wires
 * every approval kind to its real-world effect. The CLI and the server
 * import it once at startup; pipelines get the same wiring through
 * them. Kinds without a specific effector fall back to artifact filing
 * (see src/os/effectors.ts), which is always safe.
 *
 * Later phases register here:
 *   P3 leads:  outreach_message, sourcing_batch, reply_class
 *   P5 money:  invoice_reminder, case_study guard
 *   P6 build:  design_spec, build_review, launch_checklist
 */

import { registerEffector } from "./os/effectors.js";
import type { Json } from "./os/store/types.js";

// Case studies publish only with documented written client approval.
// This guard exists from day one; the filing itself is the default
// artifact effector after the check passes.
import { fileArtifact } from "./os/effectors.js";

registerEffector("case_study", async (args) => {
  const payload = args.payload as Json;
  if (payload.client_written_approval !== true) {
    throw new Error(
      "case study refused: no documented written client approval on the payload (docs/06 workflow 14).",
    );
  }
  await fileArtifact(args);
});
