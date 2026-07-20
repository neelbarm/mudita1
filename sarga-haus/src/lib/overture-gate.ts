/**
 * A tiny bus between the Overture (the opening sequence) and the rest
 * of the site. Module-level so it needs no context plumbing.
 *
 * Two signals live here. revealPage/onReveal lets anything hold its
 * entrance until the page is ready (it now fires immediately on load;
 * the Overture no longer gates first paint). requestOverture lets any
 * element, like the pendant lamp in the hero, ask for the show.
 */

let revealed = false;
const revealSubs = new Set<() => void>();

export function revealPage() {
  if (revealed) return;
  revealed = true;
  revealSubs.forEach((fn) => fn());
  revealSubs.clear();
}

/** Runs fn when the page is revealed; immediately if it already was. */
export function onReveal(fn: () => void): () => void {
  if (revealed) {
    fn();
    return () => {};
  }
  revealSubs.add(fn);
  return () => {
    revealSubs.delete(fn);
  };
}

const requestSubs = new Set<() => void>();

/** Ask the Overture to play. Safe to call anywhere, any time. */
export function requestOverture() {
  requestSubs.forEach((fn) => fn());
}

export function onOvertureRequest(fn: () => void): () => void {
  requestSubs.add(fn);
  return () => {
    requestSubs.delete(fn);
  };
}
