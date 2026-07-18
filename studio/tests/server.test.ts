import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/server/app.js";
import { unsubscribeToken } from "../src/leads/mail/unsubscribe.js";
import { verifyStripe, verifySvix } from "../src/server/verify.js";
import { freshStore, seedAccountContact } from "./helpers.js";
import { getStore } from "../src/os/store/index.js";

describe("studio server", () => {
  beforeEach(() => {
    freshStore();
  });

  it("health is public; actions run open in dev mode (no token set)", async () => {
    const app = buildApp();
    const health = await app.request("/health");
    expect(health.status).toBe(200);

    const triage = await app.request("/actions/intake/triage", { method: "POST" });
    expect(triage.status).toBe(200);
    expect(((await triage.json()) as { new: unknown[] }).new).toEqual([]);
  });

  it("runs an agent and reports the approval id", async () => {
    const app = buildApp();
    const res = await app.request("/actions/run-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "strategy-partner", dry_run: true }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; approval_id: string | null };
    expect(body.status).toBe("succeeded");
    expect(body.approval_id).toBeTruthy();

    const list = await app.request("/approvals");
    const rows = (await list.json()) as Array<{ id: string }>;
    expect(rows.some((r) => r.id === body.approval_id)).toBe(true);

    const decision = await app.request(`/approvals/${body.approval_id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "approved", decided_by: "neel" }),
    });
    expect(decision.status).toBe(200);
  });

  it("the unsubscribe link suppresses permanently", async () => {
    const store = freshStore();
    const { contact } = await seedAccountContact(store, { email: "maya@harbor.example" });
    const app = buildApp();
    const res = await app.request(`/u/${unsubscribeToken("maya@harbor.example")}`);
    expect(res.status).toBe(200);
    expect(await store.isSuppressed("maya@harbor.example")).toBe(true);
    const updated = await store.get("contacts", contact.id);
    expect(updated!.opted_out_at).not.toBeNull();

    const bad = await app.request("/u/not-a-token");
    expect(bad.status).toBe(400);
  });

  it("stripe webhook flips an invoice to paid and records the payment", async () => {
    const store = freshStore();
    await store.insert("ledger_entries", {
      entry_date: "2026-07-01",
      kind: "invoice",
      amount: 7000,
      status: "open",
      external_id: "stripe-in_123",
      memo: "INV-1",
    });
    const app = buildApp();
    const res = await app.request("/webhooks/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "invoice.paid",
        data: { object: { id: "in_123", amount_paid: 700000, currency: "usd", number: "INV-1" } },
      }),
    });
    expect(res.status).toBe(200);
    const entries = await store.list("ledger_entries");
    expect(entries.find((e) => e.external_id === "stripe-in_123")!.status).toBe("paid");
    expect(entries.some((e) => e.kind === "payment" && Number(e.amount) === 7000)).toBe(true);
  });
});

describe("webhook signature verification", () => {
  it("svix verifies and rejects", () => {
    const secret = "whsec_" + Buffer.from("test-secret-key").toString("base64");
    const body = '{"hello":"world"}';
    const id = "msg_1";
    const ts = "1700000000";
    const mac = createHmac("sha256", Buffer.from("test-secret-key"))
      .update(`${id}.${ts}.${body}`)
      .digest("base64");
    const headers = { "svix-id": id, "svix-timestamp": ts, "svix-signature": `v1,${mac}` };
    expect(verifySvix(secret, headers, body)).toBe(true);
    expect(verifySvix(secret, headers, body + "tampered")).toBe(false);
    expect(verifySvix(undefined, {}, body)).toBe(true); // dev mode accepts + warns
  });

  it("stripe verifies and rejects", () => {
    const secret = "whsec_test";
    const body = '{"type":"invoice.paid"}';
    const t = "1700000000";
    const v1 = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
    expect(verifyStripe(secret, `t=${t},v1=${v1}`, body)).toBe(true);
    expect(verifyStripe(secret, `t=${t},v1=deadbeef`, body)).toBe(false);
  });
});
