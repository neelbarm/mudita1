import { beforeEach, describe, expect, it } from "vitest";
import "../src/effects.js";
import { buildApp } from "../src/server/app.js";
import { runAgent } from "../src/agents/runner.js";
import { freshStore } from "./helpers.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { dir } from "../src/os/config.js";
import type { Json } from "../src/os/store/types.js";

function fixtureInput(slug: string): Json {
  const f = path.join(dir.fixtures, "agents", slug, "default.json");
  return (JSON.parse(readFileSync(f, "utf8")) as { input: Json }).input;
}

describe("headquarters", () => {
  beforeEach(() => {
    freshStore();
  });

  it("serves the deck and the aggregate feed", async () => {
    const app = buildApp();
    const page = await app.request("/hq");
    expect(page.status).toBe(200);
    const html = await page.text();
    expect(html).toContain("Headquarters");
    expect(html).toContain("The wire");

    const res = await app.request("/hq/data");
    expect(res.status).toBe(200);
    const d = (await res.json()) as Record<string, unknown>;
    for (const key of ["operator", "capabilities", "approvals", "events", "staff", "leadFlow", "pipeline", "weekly", "cash", "stalled", "dueCount", "sendsToday", "maxDailySends"]) {
      expect(d, key).toHaveProperty(key);
    }
    expect((d.staff as unknown[]).length).toBe(17);
  });

  it("reflects a drafted approval, and a deck decision fires the effector trail", async () => {
    const app = buildApp();
    await runAgent("strategy-partner", fixtureInput("strategy-partner"), { trigger: "sim", mode: "dry_run" });

    let d = (await (await app.request("/hq/data")).json()) as { approvals: Array<{ id: string; title: string }> };
    expect(d.approvals).toHaveLength(1);
    expect(d.approvals[0]!.title).toContain("[draft]");

    const decide = await app.request(`/approvals/${d.approvals[0]!.id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "approved", decided_by: "neel" }),
    });
    expect(decide.status).toBe(200);

    const after = (await (await app.request("/hq/data")).json()) as { approvals: unknown[] };
    expect(after.approvals).toHaveLength(0);
  });
});
