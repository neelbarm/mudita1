#!/usr/bin/env node
/**
 * Generates the 12 n8n workflow JSONs in deploy/n8n/workflows/.
 * Run after editing: node deploy/n8n/generate.mjs
 * Import each file in n8n; create one Header Auth credential named
 * "Studio API" (Authorization: Bearer <STUDIO_API_TOKEN>).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "workflows");
mkdirSync(OUT, { recursive: true });

const SERVER = "http://studio-server:8787";
let nodeId = 0;
const id = () => `node-${++nodeId}`;

function schedule(cron) {
  return {
    id: id(),
    name: "Schedule",
    type: "n8n-nodes-base.scheduleTrigger",
    typeVersion: 1.2,
    position: [0, 0],
    parameters: { rule: { interval: [{ field: "cronExpression", expression: cron }] } },
  };
}

function webhook(pathName) {
  return {
    id: id(),
    name: "Webhook",
    type: "n8n-nodes-base.webhook",
    typeVersion: 2,
    position: [0, 0],
    parameters: { httpMethod: "POST", path: pathName, responseMode: "onReceived" },
  };
}

function studioCall(name, route, body = {}) {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 4.2,
    position: [260, 0],
    parameters: {
      method: "POST",
      url: `${SERVER}${route}`,
      authentication: "genericCredentialType",
      genericAuthType: "httpHeaderAuth",
      sendBody: Object.keys(body).length > 0,
      specifyBody: "json",
      jsonBody: JSON.stringify(body),
    },
    credentials: { httpHeaderAuth: { name: "Studio API" } },
  };
}

function forwardCall(name, route) {
  const n = studioCall(name, route);
  n.parameters.sendBody = true;
  n.parameters.specifyBody = "json";
  n.parameters.jsonBody = "={{ JSON.stringify($json.body ?? $json) }}";
  return n;
}

function workflow(name, trigger, action, note) {
  return {
    name,
    nodes: [
      trigger,
      action,
      {
        id: id(),
        name: "Note",
        type: "n8n-nodes-base.stickyNote",
        typeVersion: 1,
        position: [0, -160],
        parameters: { content: note, width: 460, height: 120 },
      },
    ],
    connections: { [trigger.name]: { main: [[{ node: action.name, type: "main", index: 0 }]] } },
    active: false,
    settings: { executionOrder: "v1" },
  };
}

const workflows = [
  ["01-daily-queue", workflow(
    "Sarga 01 · Daily queue",
    schedule("0 8 * * 1-5"),
    studioCall("Advance due enrollments", "/actions/queue/advance"),
    "Weekday 08:00: draft every due touch into the approval queue. Nothing sends; you approve in `sarga approve` or via Slack ping.",
  )],
  ["02-stall-watcher", workflow(
    "Sarga 02 · Stall watcher",
    schedule("30 8 * * 1-5"),
    studioCall("Stall check", "/actions/stall-check"),
    "Weekday 08:30: anything idle 14+ days gets one suggested next action, queued for you.",
  )],
  ["03-weekly-report", workflow(
    "Sarga 03 · Weekly report",
    schedule("0 15 * * 5"),
    studioCall("Draft weekly report", "/actions/report/weekly"),
    "Friday 15:00: the seven metrics narrated by the Reporting Writer, into the queue. Runs after the finance digest (11).",
  )],
  ["04-sourcing-weekly", workflow(
    "Sarga 04 · Sourcing weekly",
    schedule("0 9 * * 1"),
    studioCall("Run sourcing", "/actions/sourcing/run", { kind: "csv", file: "fixtures/sourcing/sample-import.csv" }),
    "Monday 09:00: run the week's sourcing per the approved ICP slice (.local/icp-slice.json). Swap the body for site_signals/directory runs. Maps is CLI-only, on purpose.",
  )],
  ["05-dunning", workflow(
    "Sarga 05 · Dunning tick",
    schedule("30 9 * * 1-5"),
    studioCall("Dunning tick", "/actions/finance/dunning-tick"),
    "Weekday 09:30: day 3/7 reminders drafted for approval, day 10 call flag, day 14 pause flag. Humans send; always.",
  )],
  ["06-intake-triage", workflow(
    "Sarga 06 · Intake triage",
    schedule("*/30 * * * *"),
    studioCall("Poll new intake", "/actions/intake/triage"),
    "Every 30 minutes: polls intake_submissions with status=new and pings you. The site stays untouched; this only reads.",
  )],
  ["07-reply-handler", workflow(
    "Sarga 07 · Reply handler",
    webhook("sarga-reply"),
    forwardCall("Forward to studio", "/webhooks/resend-inbound"),
    "Point Resend's inbound webhook here (or directly at the studio server). Replies are recorded, classified, and queued for your confirmation.",
  )],
  ["08-booking-webhook", workflow(
    "Sarga 08 · Booking webhook",
    webhook("sarga-booking"),
    forwardCall("Forward to studio", "/webhooks/calcom"),
    "Point Cal.com's webhook here. Bookings flip matching intake to call_booked and ping you with prep.",
  )],
  ["09-approval-notify", workflow(
    "Sarga 09 · Approval poll",
    schedule("0 */2 * * *"),
    studioCall("List pending", "/approvals"),
    "Every 2 hours: fetch pending approvals. The server already pings Slack on each new item; this is the belt to that suspender. Wire the output to any channel you like.",
  )],
  ["10-strategy-memo", workflow(
    "Sarga 10 · Partner memo",
    schedule("0 7 * * 1"),
    studioCall("Draft strategy memo", "/actions/strategy/memo"),
    "Monday 07:00: the ex-VC partner memo: pipeline read, kill/double-down, pricing counsel, the quarterly ICP slice.",
  )],
  ["11-finance-digest", workflow(
    "Sarga 11 · Finance digest",
    schedule("0 14 * * 5"),
    studioCall("Draft finance digest", "/actions/finance/digest"),
    "Friday 14:00: computed numbers, narrated. Runs an hour before the weekly report so the report can cite it.",
  )],
  ["12-content-calendar", (() => {
    const w = workflow(
      "Sarga 12 · Content cadence",
      schedule("30 7 * * 1"),
      studioCall("Draft content", "/actions/run-agent", { slug: "content-writer" }),
      "Monday 07:30, DISABLED by default: drafts the week's essay/post from the content calendar. Enable when you are ready to publish weekly.",
    );
    return w;
  })()],
];

for (const [file, wf] of workflows) {
  writeFileSync(path.join(OUT, `${file}.json`), JSON.stringify(wf, null, 2) + "\n");
  console.log(`wrote ${file}.json`);
}
