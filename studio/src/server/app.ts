import { Hono } from "hono";
import "../effects.js";
import { cfg } from "../os/config.js";
import { capabilities } from "../os/capabilities.js";
import { log } from "../os/log.js";
import { decide, listPending } from "../os/approvals.js";
import { getStore } from "../os/store/index.js";
import { notify } from "../os/notify.js";
import { runAgent } from "../agents/runner.js";
import { dueEnrollments } from "../leads/sequence/queue.js";
import { advanceEnrollment } from "../leads/sequence/advance.js";
import { ingestReply, handleBounce } from "../leads/sequence/replies.js";
import { draftWeeklyReport } from "../leads/report.js";
import { runSourceJob } from "../leads/sourcing/run.js";
import { CsvConnector } from "../leads/sourcing/csv.js";
import { suppress, verifyUnsubscribeToken } from "../leads/mail/unsubscribe.js";
import { draftFinanceDigest } from "../finance/digest.js";
import { dunningTick } from "../finance/dunning.js";
import { handleStripeEvent } from "../finance/stripe.js";
import { draftStrategyMemo } from "../strategy/gather.js";
import { verifyCalcom, verifyStripe, verifySvix } from "./verify.js";
import type { Json } from "../os/store/types.js";

/**
 * The studio server: what n8n (and anything else local) talks to.
 * Bearer-authed actions and approvals; signature-verified webhooks;
 * one public route: the unsubscribe link.
 */

let warnedOpen = false;

export function buildApp(): Hono {
  const app = new Hono();

  const auth = async (c: { req: { header: (n: string) => string | undefined } }, next: () => Promise<void>) => {
    if (!cfg.STUDIO_API_TOKEN) {
      if (!warnedOpen) {
        warnedOpen = true;
        log.warn("STUDIO_API_TOKEN not set: server actions are open on localhost (dev mode)");
      }
      return next();
    }
    const header = c.req.header("authorization") ?? "";
    if (header !== `Bearer ${cfg.STUDIO_API_TOKEN}`) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    return next();
  };

  app.get("/health", (c) => c.json({ ok: true, time: new Date().toISOString() }));

  app.get("/doctor", auth, (c) => c.json({ operator: cfg.operator, capabilities: capabilities() }));

  // ------------------------------------------------------- approvals ----
  app.get("/approvals", auth, async (c) => c.json(await listPending()));
  app.get("/approvals/:id", auth, async (c) => {
    const approval = await getStore().get("approvals", c.req.param("id"));
    return approval ? c.json(approval) : c.json({ error: "not found" }, 404);
  });
  app.post("/approvals/:id/decision", auth, async (c) => {
    const body = (await c.req.json()) as {
      decision: "approved" | "rejected";
      decided_by?: string;
      note?: string;
      edited_payload?: Json;
    };
    try {
      const updated = await decide(c.req.param("id"), {
        decision: body.decision,
        decidedBy: body.decided_by,
        note: body.note,
        editedPayload: body.edited_payload,
      });
      return c.json(updated);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : String(err) }, 422);
    }
  });

  // --------------------------------------------------------- actions ----
  app.post("/actions/run-agent", auth, async (c) => {
    const body = (await c.req.json()) as { slug: string; input?: Json; dry_run?: boolean };
    const { run, approval } = await runAgent(body.slug, body.input ?? {}, {
      trigger: "n8n",
      mode: body.dry_run ? "dry_run" : undefined,
    });
    return c.json({ run_id: run.id, status: run.status, approval_id: approval?.id ?? null });
  });

  app.post("/actions/queue/advance", auth, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { dry_run?: boolean };
    const due = await dueEnrollments();
    let drafted = 0;
    for (const e of due) {
      const approval = await advanceEnrollment(e, { trigger: "n8n", dryRun: body.dry_run });
      if (approval) drafted += 1;
    }
    return c.json({ due: due.length, drafted });
  });

  app.post("/actions/stall-check", auth, async (c) => {
    const stalled = await getStore().view("v_stalled");
    if (stalled.length === 0) return c.json({ stalled: 0, approval_id: null });
    const body = (await c.req.json().catch(() => ({}))) as { dry_run?: boolean };
    const { approval } = await runAgent("stall-watcher", { stalled }, {
      trigger: "n8n",
      mode: body.dry_run ? "dry_run" : undefined,
    });
    return c.json({ stalled: stalled.length, approval_id: approval?.id ?? null });
  });

  app.post("/actions/report/weekly", auth, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { shipped?: string[]; dry_run?: boolean };
    const approval = await draftWeeklyReport({ shipped: body.shipped, trigger: "n8n", dryRun: body.dry_run });
    return c.json({ approval_id: approval?.id ?? null });
  });

  app.post("/actions/finance/digest", auth, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { dry_run?: boolean };
    const approval = await draftFinanceDigest({ trigger: "n8n", dryRun: body.dry_run });
    return c.json({ approval_id: approval?.id ?? null });
  });

  app.post("/actions/finance/dunning-tick", auth, async (c) => c.json(await dunningTick()));

  app.post("/actions/strategy/memo", auth, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { dry_run?: boolean };
    const approval = await draftStrategyMemo({ trigger: "n8n", dryRun: body.dry_run });
    return c.json({ approval_id: approval?.id ?? null });
  });

  app.post("/actions/sourcing/run", auth, async (c) => {
    const body = (await c.req.json()) as { kind: string; file?: string; domain?: string; url?: string; geo?: string };
    if (body.kind === "csv") {
      const r = await runSourceJob(new CsvConnector(), { file: body.file });
      return c.json({ fresh: r.fresh, duplicates: r.duplicates, approval_id: r.approval?.id ?? null });
    }
    if (body.kind === "site_signals") {
      const { SiteSignalsConnector } = await import("../leads/sourcing/hyperbrowser/site-signals.js");
      const r = await runSourceJob(new SiteSignalsConnector(), { domain: body.domain });
      return c.json({ fresh: r.fresh, approval_id: r.approval?.id ?? null });
    }
    if (body.kind === "directory") {
      const { DirectoryConnector } = await import("../leads/sourcing/hyperbrowser/directories.js");
      const r = await runSourceJob(new DirectoryConnector(), { url: body.url, geo: body.geo ?? null });
      return c.json({ fresh: r.fresh, approval_id: r.approval?.id ?? null });
    }
    return c.json({ error: `unknown sourcing kind "${body.kind}" (maps is CLI-only, by design)` }, 400);
  });

  app.post("/actions/intake/triage", auth, async (c) => {
    const store = getStore();
    const fresh = await store.list("intake_submissions", { where: { status: "new" } });
    if (fresh.length > 0) {
      await notify(
        `${fresh.length} new intake submission${fresh.length === 1 ? "" : "s"}: ` +
          fresh.map((s) => `${s.name} (${s.category}, ${s.budget ?? "budget unset"})`).join(" · "),
      );
    }
    return c.json({
      new: fresh.map((s) => ({ id: s.id, name: s.name, email: s.email, category: s.category, budget: s.budget, building: s.building.slice(0, 200) })),
    });
  });

  // -------------------------------------------------------- webhooks ----
  app.post("/webhooks/resend-inbound", async (c) => {
    const body = await c.req.text();
    if (!verifySvix(cfg.RESEND_WEBHOOK_SECRET, {
      "svix-id": c.req.header("svix-id"),
      "svix-timestamp": c.req.header("svix-timestamp"),
      "svix-signature": c.req.header("svix-signature"),
    }, body)) {
      return c.json({ error: "bad signature" }, 401);
    }
    const event = JSON.parse(body) as { type?: string; data?: { from?: string; subject?: string; text?: string; html?: string } };
    const d = event.data ?? {};
    if (d.from && (d.text || d.html)) {
      await ingestReply({ from: d.from, subject: d.subject, body: d.text ?? String(d.html) });
    }
    return c.json({ ok: true });
  });

  app.post("/webhooks/resend-events", async (c) => {
    const body = await c.req.text();
    if (!verifySvix(cfg.RESEND_WEBHOOK_SECRET, {
      "svix-id": c.req.header("svix-id"),
      "svix-timestamp": c.req.header("svix-timestamp"),
      "svix-signature": c.req.header("svix-signature"),
    }, body)) {
      return c.json({ error: "bad signature" }, 401);
    }
    const event = JSON.parse(body) as { type?: string; data?: { to?: string[]; bounce?: { type?: string } } };
    if (event.type === "email.bounced") {
      const to = event.data?.to?.[0];
      const hard = (event.data?.bounce?.type ?? "").toLowerCase() !== "soft";
      if (to) await handleBounce(to, hard);
    }
    return c.json({ ok: true });
  });

  app.post("/webhooks/stripe", async (c) => {
    const body = await c.req.text();
    if (!verifyStripe(cfg.STRIPE_WEBHOOK_SECRET, c.req.header("stripe-signature"), body)) {
      return c.json({ error: "bad signature" }, 401);
    }
    const event = JSON.parse(body) as { type: string; data: { object: Record<string, unknown> } };
    await handleStripeEvent(event);
    return c.json({ ok: true });
  });

  app.post("/webhooks/calcom", async (c) => {
    const body = await c.req.text();
    if (!verifyCalcom(cfg.CALCOM_WEBHOOK_SECRET, c.req.header("x-cal-signature-256"), body)) {
      return c.json({ error: "bad signature" }, 401);
    }
    const event = JSON.parse(body) as {
      triggerEvent?: string;
      payload?: { attendees?: Array<{ email?: string; name?: string }>; startTime?: string };
    };
    if (event.triggerEvent === "BOOKING_CREATED") {
      const attendee = event.payload?.attendees?.[0];
      const store = getStore();
      if (attendee?.email) {
        const intake = (await store.list("intake_submissions", { where: { status: ["new", "reviewed"] } })).find(
          (s) => s.email.toLowerCase() === attendee.email!.toLowerCase(),
        );
        if (intake) await store.update("intake_submissions", intake.id, { status: "call_booked" });
      }
      await notify(`call booked: ${attendee?.name ?? "someone"} (${attendee?.email ?? "?"}) at ${event.payload?.startTime ?? "?"}. Prep is a five minute read of their intake.`);
    }
    return c.json({ ok: true });
  });

  // ---------------------------------------------------------- public ----
  app.get("/u/:token", async (c) => {
    const email = verifyUnsubscribeToken(c.req.param("token"));
    if (!email) return c.html("<p>This link is not valid.</p>", 400);
    await suppress(email, "opt_out", "unsubscribe-link");
    return c.html(
      "<!doctype html><meta charset='utf-8'><title>Unsubscribed</title>" +
        "<body style='font-family:system-ui;max-width:32rem;margin:4rem auto;line-height:1.6'>" +
        "<h1 style='font-size:1.2rem'>Done. You will not hear from us again.</h1>" +
        "<p>This address is permanently removed from Sarga Haus outreach. No confirmation needed, no account, no tricks.</p></body>",
    );
  });

  return app;
}
