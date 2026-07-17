/**
 * A tiny gate between the Overture (the opening sequence) and anything
 * that wants to hold its entrance until the veil lifts. Module-level so
 * it needs no context plumbing; consumers subscribe and the Overture
 * fires exactly once per full page load.
 */

let revealed = false;
const subs = new Set<() => void>();

export function revealPage() {
  if (revealed) return;
  revealed = true;
  subs.forEach((fn) => fn());
  subs.clear();
}

/** Runs fn when the page is revealed; immediately if it already was. */
export function onReveal(fn: () => void): () => void {
  if (revealed) {
    fn();
    return () => {};
  }
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}
