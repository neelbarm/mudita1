import { describe, expect, it } from "vitest";
import { scoreIcp } from "../src/leads/scoring.js";
import { normalizeCompanyName, normalizeDomain, normalizeEmail } from "../src/leads/normalize.js";
import { companyDedupeKey, personDedupeKey } from "../src/leads/dedupe.js";
import { inQuietHours } from "../src/os/time.js";
import { suggestReplyClass } from "../src/leads/sequence/replies.js";
import { unsubscribeToken, verifyUnsubscribeToken } from "../src/leads/mail/unsubscribe.js";

describe("icp scoring (25/25/20/15/15, >=60 qualifies)", () => {
  it("maxes at 100 with everything strong", () => {
    const s = scoreIcp({
      segmentFit: "core",
      signalTypes: ["manual_workflow_evidence", "tooling_gap"],
      revenueHint: "high",
      emailStatus: "verified",
      hasLinkedin: true,
      freshestSignalDays: 5,
    });
    expect(s.segment_fit).toBe(25);
    expect(s.pain_evidence).toBe(25);
    expect(s.budget_plausibility).toBe(20);
    expect(s.reachability).toBe(15);
    expect(s.timing).toBe(15);
    expect(s.total).toBe(100);
    expect(s.qualifies).toBe(true);
  });

  it("the 59/60 boundary is exact", () => {
    // core 25 + one strong signal 15 + team-of-2 budget 10 + unverified email 5 + no linkedin + 90d timing 10 = 65
    const base = scoreIcp({
      segmentFit: "core",
      signalTypes: ["manual_workflow_evidence"],
      teamSize: 2,
      emailStatus: "unverified",
      hasLinkedin: false,
      freshestSignalDays: 90,
    });
    expect(base.total).toBe(65);
    expect(base.qualifies).toBe(true);

    // drop timing to zero: 55 -> not qualified
    const colder = scoreIcp({ segmentFit: "core", signalTypes: ["manual_workflow_evidence"], teamSize: 2, emailStatus: "unverified", hasLinkedin: false, freshestSignalDays: 400 });
    expect(colder.total).toBe(55);
    expect(colder.qualifies).toBe(false);

    // adjacent fit 15 + strong 15 + team5 15 + verified 10 + no li + 30d 15 = 70; tune to hit exactly 60/59
    const exactly60 = scoreIcp({ segmentFit: "adjacent", signalTypes: ["manual_workflow_evidence"], teamSize: 2, emailStatus: "verified", hasLinkedin: true, freshestSignalDays: 91 });
    // 15 + 15 + 10 + 15 + 5 = 60
    expect(exactly60.total).toBe(60);
    expect(exactly60.qualifies).toBe(true);

    const exactly59 = scoreIcp({ segmentFit: "adjacent", signalTypes: ["content"], teamSize: 5, emailStatus: "verified", hasLinkedin: true, freshestSignalDays: 91 });
    // 15 + 5 + 15 + 15 + 5 = 55 < 60
    expect(exactly59.qualifies).toBe(false);
  });

  it("pain caps at 25 and reach caps at 15", () => {
    const s = scoreIcp({
      segmentFit: "none",
      signalTypes: ["manual_workflow_evidence", "tooling_gap", "hiring", "launch", "content"],
      emailStatus: "verified",
      hasLinkedin: true,
      freshestSignalDays: null,
    });
    expect(s.pain_evidence).toBe(25);
    expect(s.reachability).toBe(15);
    expect(s.timing).toBe(0);
  });
});

describe("normalize + dedupe", () => {
  it("domains normalize to registrable form", () => {
    expect(normalizeDomain("https://www.Harbor-Pilates.example/booking?x=1")).toBe("harbor-pilates.example");
    expect(normalizeDomain("shop.somebrand.co.uk")).toBe("somebrand.co.uk");
    expect(normalizeDomain("not-a-domain")).toBeNull();
  });
  it("company names drop legal suffixes", () => {
    expect(normalizeCompanyName("Harbor Pilates Studio LLC")).toBe("harbor pilates studio");
    expect(normalizeCompanyName("  Bright & Co.  ")).toBe("bright &");
  });
  it("dedupe keys prefer domain and email", () => {
    expect(companyDedupeKey({ name: "Harbor", domain: "www.harbor.example" })).toBe("d:harbor.example");
    expect(companyDedupeKey({ name: "Harbor Pilates LLC", geo: "Austin" })).toBe("n:harbor pilates|austin");
    expect(personDedupeKey({ email: "Maya@Harbor.example" })).toBe("e:maya@harbor.example");
  });
  it("emails validate and lowercase", () => {
    expect(normalizeEmail(" Maya@Harbor.example ")).toBe("maya@harbor.example");
    expect(normalizeEmail("nope")).toBeNull();
  });
});

describe("quiet hours", () => {
  it("wraps midnight", () => {
    expect(inQuietHours("20-07", new Date("2026-07-18T21:30:00"))).toBe(true);
    expect(inQuietHours("20-07", new Date("2026-07-18T06:30:00"))).toBe(true);
    expect(inQuietHours("20-07", new Date("2026-07-18T12:00:00"))).toBe(false);
  });
});

describe("reply classification suggestions", () => {
  it("classifies the obvious cases", () => {
    expect(suggestReplyClass("please unsubscribe me")).toBe("opt_out");
    expect(suggestReplyClass("Not interested, thanks")).toBe("negative");
    expect(suggestReplyClass("circle back next quarter?")).toBe("later");
    expect(suggestReplyClass("I am interested, can we set up a call")).toBe("interested");
    expect(suggestReplyClass("what stack do you use?")).toBe("question");
    expect(suggestReplyClass("I am out of office until Monday")).toBe("auto");
  });
});

describe("unsubscribe tokens", () => {
  it("round-trips and rejects tampering", () => {
    const t = unsubscribeToken("maya@harbor.example");
    expect(verifyUnsubscribeToken(t)).toBe("maya@harbor.example");
    expect(verifyUnsubscribeToken(t.slice(0, -2) + "xx")).toBeNull();
    expect(verifyUnsubscribeToken("garbage")).toBeNull();
  });
});
