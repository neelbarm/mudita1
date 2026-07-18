import { AGENT_SLUGS } from "./constants.js";
import { getStore } from "./store/index.js";
import type { EventRow, Json } from "./store/types.js";

/**
 * The append-only audit stream. Every state change in the studio writes
 * here. Actor convention is enforced at this choke point:
 *   human:<name>   a person decided something
 *   agent:<slug>   one of the 17 registered agents drafted something
 */

const ACTOR_RE = /^(human|agent):[a-z0-9-]+$/;

export function assertActor(actor: string): void {
  if (!ACTOR_RE.test(actor)) {
    throw new Error(`invalid actor "${actor}": must match human:<name> or agent:<slug>`);
  }
  if (actor.startsWith("agent:")) {
    const slug = actor.slice("agent:".length);
    if (!(AGENT_SLUGS as readonly string[]).includes(slug)) {
      throw new Error(`unknown agent actor "${actor}": not one of the 17 registered agents`);
    }
  }
}

export async function writeEvent(e: {
  entity: string;
  entityId: string;
  actor: string;
  action: string;
  detail?: Json;
}): Promise<EventRow> {
  assertActor(e.actor);
  return getStore().insert("events", {
    entity: e.entity,
    entity_id: e.entityId,
    actor: e.actor,
    action: e.action,
    detail: e.detail ?? {},
  });
}
