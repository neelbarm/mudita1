import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import "../src/effects.js";
import { AGENT_SLUGS } from "../src/os/constants.js";
import { dir } from "../src/os/config.js";
import { decide } from "../src/os/approvals.js";
import { runAgent, assertNoInventedFigures, ATTORNEY_STAMP } from "../src/agents/runner.js";
import { freshStore } from "./helpers.js";
import type { Json } from "../src/os/store/types.js";

function fixtureInput(slug: string): Json {
  const f = path.join(dir.fixtures, "agents", slug, "default.json");
  return (JSON.parse(readFileSync(f, "utf8")) as { input: Json }).input;
}

describe("agent harness (all 17, dry-run)", () => {
  beforeEach(() => {
    freshStore();
  });

  it("every agent runs from its fixture and lands a [draft] approval", async () => {
    const store = freshStore();
    for (const slug of AGENT_SLUGS) {
      const { run, approval } = await runAgent(slug, fixtureInput(slug), {
        trigger: "sim",
        mode: "dry_run",
      });
      expect(run.status, slug).toBe("succeeded");
      expect(run.mode, slug).toBe("dry_run");
      expect(approval, slug).not.toBeNull();
      expect(approval!.title.startsWith("[draft]"), `${slug} title: ${approval!.title}`).toBe(true);
      expect(approval!.status, slug).toBe("pending");
    }
    expect(await store.count("agent_runs")).toBe(17);
    expect(await store.count("approvals")).toBe(17);
    const events = await store.list("events");
    const agentActors = new Set(events.filter((e) => e.actor.startsWith("agent:")).map((e) => e.actor));
    expect(agentActors.size).toBe(17);
  }, 30_000);

  it("deciding an approval requires and records the human, then fires the effector", async () => {
    const store = freshStore();
    const { approval } = await runAgent("strategy-partner", fixtureInput("strategy-partner"), {
      trigger: "sim",
      mode: "dry_run",
    });
    const updated = await decide(approval!.id, { decision: "approved", decidedBy: "neel" });
    expect(updated.status).toBe("approved");
    expect(updated.decided_by).toBe("neel");
    const events = await store.list("events", { where: { entity: "approval" } });
    expect(events.some((e) => e.actor === "human:neel" && e.action === "approval.approved")).toBe(true);
  });

  it("legal drafts always carry the attorney-review stamp", async () => {
    freshStore();
    const { output } = await runAgent("legal-drafter", fixtureInput("legal-drafter"), {
      trigger: "sim",
      mode: "dry_run",
    });
    expect(String(output.body_markdown)).toContain("DRAFT for attorney review");
    expect(ATTORNEY_STAMP).toContain("not legal advice");
  });

  it("finance narratives cannot invent figures", () => {
    const input = { computed: { cash: { received_30d: 14000 } } } as Json;
    expect(() =>
      assertNoInventedFigures(
        { narrative: "We received 14000 this month.", figures_used: [{ label: "x", value: 14000 }], recommendations: [] } as unknown as Json,
        input,
      ),
    ).not.toThrow();
    expect(() =>
      assertNoInventedFigures(
        { narrative: "We received 15250 this month.", figures_used: [], recommendations: [] } as unknown as Json,
        input,
      ),
    ).toThrow(/invented|not present/);
  });

  it("case studies refuse approval without written client approval", async () => {
    freshStore();
    const input = fixtureInput("content-writer");
    const { approval, output } = await runAgent(
      "content-writer",
      input,
      { trigger: "sim", mode: "dry_run", fixture: "case-study" },
    );
    expect(output.kind).toBe("case_study");
    expect(approval!.kind).toBe("case_study");
    await expect(decide(approval!.id, { decision: "approved", decidedBy: "neel" })).rejects.toThrow(
      /written client approval/,
    );
  });
});
