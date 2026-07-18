import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { LocalStore } from "../src/os/store/local.js";
import { setStore } from "../src/os/store/index.js";

/** Fresh LocalStore on a temp file, registered as the global store. */
export function freshStore(): LocalStore {
  const dir = mkdtempSync(path.join(tmpdir(), "sarga-test-"));
  const store = new LocalStore(path.join(dir, "db.json"));
  setStore(store);
  return store;
}

export async function seedAccountContact(store: LocalStore, over: {
  email?: string;
  optedOut?: boolean;
  icp?: number;
  emailStatus?: "unverified" | "verified" | "bounced" | "opted_out";
} = {}) {
  const account = await store.insert("accounts", {
    name: "Test Practice",
    domain: "testpractice.com",
    segment: "consultant",
    icp_score: over.icp ?? 72,
    status: "qualified",
  });
  const contact = await store.insert("contacts", {
    account_id: account.id,
    full_name: "Jordan Test",
    email: over.email ?? "jordan@testpractice.com",
    email_status: over.emailStatus ?? "verified",
    enrichment: {},
    opted_out_at: over.optedOut ? new Date().toISOString() : null,
  });
  const sequence = await store.insert("sequences", { name: "Test Seq", status: "active" });
  return { account, contact, sequence };
}
