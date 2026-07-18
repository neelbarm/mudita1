import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { dir } from "./config.js";
import { log } from "./log.js";
import type { Approval, ApprovalKind, Json } from "./store/types.js";

/**
 * Effectors: the ONLY code path from an approved queue item to a
 * real-world effect (a send, a promotion, a status flip, a filed
 * artifact). Modules register their effectors at import time via
 * registerEffector; src/effects.ts is the single registration point.
 *
 * If a kind has no registered effector, the default files the payload
 * as an artifact and nothing else happens. Approval alone never sends
 * anything anywhere.
 */

export interface EffectorArgs {
  approval: Approval;
  /** Edited payload wins over the drafted payload. */
  payload: Json;
  decidedBy: string;
}

export type Effector = (args: EffectorArgs) => Promise<void>;

const effectors = new Map<ApprovalKind, Effector>();

export function registerEffector(kind: ApprovalKind, fn: Effector): void {
  effectors.set(kind, fn);
}

export function getEffector(kind: ApprovalKind): Effector {
  return effectors.get(kind) ?? fileArtifact;
}

/** Default effector: write the approved payload under artifacts/<kind>/. */
export const fileArtifact: Effector = async ({ approval, payload }) => {
  const folder = path.join(dir.artifacts, approval.kind);
  mkdirSync(folder, { recursive: true });
  const base = path.join(folder, `${approval.created_at.slice(0, 10)}-${approval.id.slice(0, 8)}`);
  const body = pickMarkdown(payload);
  if (body) {
    writeFileSync(`${base}.md`, body);
  }
  writeFileSync(`${base}.json`, JSON.stringify({ approval: approval.id, payload }, null, 2));
  log.ok(`filed artifact ${base}${body ? ".md" : ".json"}`);
};

function pickMarkdown(payload: Json): string | null {
  for (const key of ["body_markdown", "body", "narrative", "content"]) {
    const v = payload[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}
