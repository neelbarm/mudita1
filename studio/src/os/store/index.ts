import { caps } from "../capabilities.js";
import { LocalStore } from "./local.js";
import { SupabaseStore } from "./supabase.js";
import type { StorePort } from "./port.js";

let instance: StorePort | null = null;

/** The studio's store: Supabase when keys exist, local JSON otherwise. */
export function getStore(): StorePort {
  if (!instance) {
    instance = caps.dbIsSupabase() ? new SupabaseStore() : new LocalStore();
  }
  return instance;
}

/** Test hook: swap the store (e.g. a LocalStore on a temp file). */
export function setStore(store: StorePort | null) {
  instance = store;
}

export type { StorePort, ListOpts } from "./port.js";
export { StoreInvariantError } from "./port.js";
export { LocalStore } from "./local.js";
export * from "./types.js";
