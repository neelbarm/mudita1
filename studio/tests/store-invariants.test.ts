import { describe, expect, it } from "vitest";
import { freshStore, seedAccountContact } from "./helpers.js";
import { StoreInvariantError } from "../src/os/store/index.js";

describe("store invariants (LocalStore mirrors Postgres constraints)", () => {
  it("refuses outbound touches without a named approver", async () => {
    const store = freshStore();
    const { contact, sequence } = await seedAccountContact(store);
    const enrollment = await store.insert("enrollments", {
      contact_id: contact.id,
      sequence_id: sequence.id,
      state: "active",
    });
    await expect(
      store.insert("touches", {
        enrollment_id: enrollment.id,
        direction: "outbound",
        channel: "email",
        body: "hello",
      }),
    ).rejects.toThrow(StoreInvariantError);

    const ok = await store.insert("touches", {
      enrollment_id: enrollment.id,
      direction: "outbound",
      channel: "email",
      body: "hello",
      approved_by: "neel",
    });
    expect(ok.approved_by).toBe("neel");
  });

  it("refuses to enroll an opted-out contact (trg_block_opted_out twin)", async () => {
    const store = freshStore();
    const { contact, sequence } = await seedAccountContact(store, { optedOut: true });
    await expect(
      store.insert("enrollments", { contact_id: contact.id, sequence_id: sequence.id }),
    ).rejects.toThrow(/suppressed \(opted out\)/);
  });

  it("refuses to enroll a contact on the permanent suppression list", async () => {
    const store = freshStore();
    const { contact, sequence } = await seedAccountContact(store, { email: "Someone@Example.com" });
    await store.insert("suppressions", { email: "someone@example.com", reason: "opt_out" });
    await expect(
      store.insert("enrollments", { contact_id: contact.id, sequence_id: sequence.id }),
    ).rejects.toThrow(/permanent suppression/);
  });

  it("refuses approval decisions without a named human", async () => {
    const store = freshStore();
    const approval = await store.insert("approvals", {
      kind: "outreach_message",
      title: "[draft] test",
      payload: {},
    });
    await expect(store.update("approvals", approval.id, { status: "approved" })).rejects.toThrow(
      /decided_by/,
    );
    const ok = await store.update("approvals", approval.id, {
      status: "approved",
      decided_by: "neel",
    });
    expect(ok.status).toBe("approved");
  });

  it("refuses facts without a source url (cite it or discard it)", async () => {
    const store = freshStore();
    const { account } = await seedAccountContact(store);
    await expect(
      store.insert("facts", { account_id: account.id, fact: "grew fast" }),
    ).rejects.toThrow(/source_url/);
  });
});
