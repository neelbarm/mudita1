import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import pc from "picocolors";
import "../effects.js";
import { dir } from "../os/config.js";
import { decide, listPending } from "../os/approvals.js";
import { LocalStore } from "../os/store/local.js";
import { setStore, getStore } from "../os/store/index.js";
import { runAgent } from "../agents/runner.js";
import { CsvConnector } from "../leads/sourcing/csv.js";
import { runSourceJob } from "../leads/sourcing/run.js";
import { approveFact } from "../leads/facts.js";
import { scoreIcp } from "../leads/scoring.js";
import { outreachReady } from "../leads/readiness.js";
import { enrollContact } from "../leads/sequence/enroll.js";
import { dueEnrollments } from "../leads/sequence/queue.js";
import { advanceEnrollment } from "../leads/sequence/advance.js";
import { ingestReply } from "../leads/sequence/replies.js";
import { suppress } from "../leads/mail/unsubscribe.js";
import type { SignalType } from "../os/store/types.js";

/**
 * sim:leadflow — the whole lead engine, end to end, zero keys:
 * csv -> gate -> promote -> brief -> facts -> score -> enroll ->
 * daily queue -> draft -> approve -> outbox send -> reply ->
 * classify -> conversation. Prints each beat; exits nonzero if any
 * invariant breaks.
 */

let step = 0;
function beat(msg: string) {
  step += 1;
  console.log(pc.yellow(`\n${String(step).padStart(2, "0")}`), pc.bold(msg));
}
function ok(msg: string) {
  console.log(pc.green("   ok"), msg);
}
function expect(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    console.error(pc.red(`   FAIL ${msg}`));
    process.exit(1);
  }
}

async function main() {
  const dbFile = path.join(dir.local, "sim-leadflow.json");
  if (existsSync(dbFile)) rmSync(dbFile);
  const store = new LocalStore(dbFile);
  setStore(store);
  const countOutbox = () =>
    existsSync(dir.outbox) ? readdirSync(dir.outbox).filter((f) => f.endsWith(".json")).length : 0;
  const outboxBefore = countOutbox();

  beat("seed the default sequence (4 touches over 21 days)");
  const seq = await store.insert("sequences", { name: "Founders Default - 4x21", status: "active", channel_mix: "email, email, linkedin, email" });
  const stepDefs: Array<[number, "email" | "linkedin"]> = [[0, "email"], [4, "email"], [11, "linkedin"], [21, "email"]];
  for (const [day, channel] of stepDefs) {
    await store.insert("sequence_steps", { sequence_id: seq.id, day_offset: day, channel, template: `day ${day}` });
  }
  ok("sequence + 4 steps");

  beat("source the sample CSV (candidates only, behind the gate)");
  const { fresh, approval: batchApproval } = await runSourceJob(new CsvConnector(), {
    file: path.join(dir.fixtures, "sourcing", "sample-import.csv"),
  });
  expect(fresh >= 5, `expected >=5 fresh raw records, got ${fresh}`);
  expect(batchApproval, "sourcing batch approval queued");
  expect((await store.count("accounts")) === 0, "no accounts before the gate. The gate is real.");
  ok(`${fresh} raw records; zero accounts until a human says so`);

  beat("approve the sourcing batch (human gate #1)");
  await decide(batchApproval.id, { decision: "approved", decidedBy: "neel" });
  const accounts = await store.list("accounts");
  const contacts = await store.list("contacts");
  expect(accounts.length === 3, `3 accounts, got ${accounts.length}`);
  expect(contacts.length === 3, `3 contacts, got ${contacts.length}`);
  ok(`promoted: ${accounts.length} accounts, ${contacts.length} contacts`);

  const harbor = accounts.find((a) => a.name.includes("Harbor"))!;
  expect(harbor, "harbor account exists");
  const maya = contacts.find((c) => c.full_name.startsWith("Maya"))!;

  beat("record signals from the site crawl (cited)");
  const signals: Array<[SignalType, string]> = [
    ["manual_workflow_evidence", "Manual booking path stated on site: DM to book"],
    ["manual_workflow_evidence", "Waitlist handled by text message"],
  ];
  for (const [type, detail] of signals) {
    await store.insert("signals", {
      account_id: harbor.id, type, detail,
      url: "https://harborpilates.example/", observed_at: new Date().toISOString().slice(0, 10),
    });
  }
  ok("2 signals with source urls");

  beat("account researcher drafts the brief (dry-run agent)");
  const { approval: briefApproval } = await runAgent("account-researcher", { account: { name: harbor.name } }, {
    trigger: "sim", mode: "dry_run", entity: "account", entityId: harbor.id,
  });
  expect(briefApproval?.title.startsWith("[draft]"), "brief is a [draft]");
  await decide(briefApproval!.id, { decision: "approved", decidedBy: "neel" });
  const candidates = await store.list("facts", { where: { account_id: harbor.id } });
  expect(candidates.length >= 3, `brief promoted ${candidates.length} fact candidates`);
  ok(`brief accepted -> ${candidates.length} fact candidates`);

  beat("approve 3 facts (cite it or it does not exist)");
  for (const f of candidates.slice(0, 3)) await approveFact(f.id, "neel");
  ok("3 approved facts");

  beat("verify the contact address (provider stubbed in sim)");
  await store.update("contacts", maya.id, { email_status: "verified" });
  ok("maya@ verified");

  beat("score with the deterministic rubric");
  const breakdown = scoreIcp({
    segmentFit: "core",
    signalTypes: signals.map(([t]) => t),
    emailStatus: "verified",
    hasLinkedin: true,
    freshestSignalDays: 3,
    teamSize: 6,
  });
  await store.update("accounts", harbor.id, { icp_score: breakdown.total, status: "qualified" });
  expect(breakdown.qualifies, `score ${breakdown.total} qualifies`);
  ok(`icp ${breakdown.total} (25/${breakdown.pain_evidence}/${breakdown.budget_plausibility}/${breakdown.reachability}/${breakdown.timing}) qualified`);

  beat("readiness gate: all five conditions");
  const readiness = await outreachReady(store, maya.id, { assumeSequence: true });
  expect(readiness.ready, `ready, but: ${readiness.reasons.join("; ")}`);
  ok("verified email + icp >= 60 + 3 approved facts + no suppression");

  beat("enroll and hit the daily queue");
  await enrollContact(maya.id, { by: "neel" });
  const due = await dueEnrollments();
  expect(due.length === 1, "one due enrollment");
  ok("enrollment due now");

  beat("outreach drafter writes day 0 (approved facts only)");
  const outreachApproval = await advanceEnrollment(due[0]!, { trigger: "sim", dryRun: true });
  expect(outreachApproval, "outreach draft queued");
  expect(outreachApproval!.kind === "outreach_message", "kind outreach_message");
  ok(`queued: ${outreachApproval!.title}`);

  beat("approve the message (human gate #2) -> compliant outbox send");
  await decide(outreachApproval!.id, { decision: "approved", decidedBy: "neel" });
  const touches = await store.list("touches");
  expect(touches.length === 1 && touches[0]!.direction === "outbound", "one outbound touch");
  expect(touches[0]!.approved_by === "neel", "touch carries the named approver");
  expect(countOutbox() > outboxBefore, "outbox file written (no key, no live send)");
  const enrollment = (await store.list("enrollments"))[0]!;
  expect(enrollment.current_step === 1 && enrollment.state === "active", "enrollment advanced to step 1");
  const harborNow = await store.get("accounts", harbor.id);
  expect(harborNow!.status === "outreach", "account moved to outreach");
  ok("sent to outbox with footer + unsubscribe; clock set for day 4");

  beat("an interested reply arrives");
  const replyRes = await ingestReply(
    JSON.parse(
      (await import("node:fs")).readFileSync(path.join(dir.fixtures, "inbound", "reply-interested.json"), "utf8"),
    ) as { from: string; subject?: string; body: string },
  );
  expect(replyRes, "reply matched the contact");
  expect(String(replyRes!.approval.payload.suggested) === "interested", "classifier suggests interested");
  ok("inbound touch recorded; class suggestion queued for human confirmation");

  beat("confirm the class (human gate #3) -> conversation opens");
  await decide(replyRes!.approval.id, { decision: "approved", decidedBy: "neel" });
  const harborFinal = await store.get("accounts", harbor.id);
  expect(harborFinal!.status === "conversation", "account is in conversation");
  ok("account: conversation. Same-day human reply is now the rule.");

  beat("suppression is permanent (the one-way door)");
  const dana = (await store.list("contacts")).find((c) => c.full_name.startsWith("Dana"))!;
  await suppress(dana.email!, "opt_out", "sim");
  let blocked = false;
  try {
    await enrollContact(dana.id, { by: "neel" });
  } catch {
    blocked = true;
  }
  expect(blocked, "suppressed contact cannot be enrolled");
  ok("re-enrollment refused for a suppressed address");

  beat("the weekly metrics view (approved sends only)");
  const [metrics] = await store.view("v_weekly_metrics");
  expect(Number(metrics!.contacted) === 1, "contacted counts approved sends only");
  console.log(
    "   " +
      pc.dim(
        `researched ${metrics!.accounts_researched} · qualified ${metrics!.qualified} · contacted ${metrics!.contacted} · replies ${metrics!.replies} · conversations ${metrics!.conversations} · opportunities ${metrics!.opportunities} · pipeline ${metrics!.pipeline_value}`,
      ),
  );

  const pending = await listPending();
  const events = await getStore().count("events");
  console.log(pc.green(`\nleadflow sim complete: ${step} beats, ${events} events, ${pending.length} items left in queue.\n`));
}

main().catch((err) => {
  console.error(pc.red("sim failed:"), err);
  process.exit(1);
});
