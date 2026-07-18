import { describe, expect, it } from "vitest";
import { freshStore } from "./helpers.js";
import { assertActor, writeEvent } from "../src/os/events.js";

describe("events actor convention", () => {
  it("accepts human:<name> and agent:<registered-slug>", () => {
    expect(() => assertActor("human:neel")).not.toThrow();
    expect(() => assertActor("agent:outreach-drafter")).not.toThrow();
    expect(() => assertActor("agent:strategy-partner")).not.toThrow();
  });

  it("rejects malformed actors and unregistered agents", () => {
    expect(() => assertActor("neel")).toThrow(/invalid actor/);
    expect(() => assertActor("agent:Sales Bot")).toThrow(/invalid actor/);
    expect(() => assertActor("agent:unknown-agent")).toThrow(/not one of the 17/);
    expect(() => assertActor("system:cron")).toThrow(/invalid actor/);
  });

  it("writes through to the store", async () => {
    const store = freshStore();
    const e = await writeEvent({
      entity: "account",
      entityId: "00000000-0000-4000-8000-000000000001",
      actor: "agent:account-researcher",
      action: "account.brief_drafted",
      detail: { note: "test" },
    });
    expect(e.actor).toBe("agent:account-researcher");
    expect(await store.count("events")).toBe(1);
  });
});
