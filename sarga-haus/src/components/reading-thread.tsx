"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * A brass thread under the nav that fills as the essay is read. The
 * scroll position is the bookmark. Reduced motion binds it directly
 * with no spring; it is decorative either way.
 */
export function ReadingThread() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const eased = useSpring(scrollYProgress, { stiffness: 130, damping: 26, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-16 z-40 h-px origin-left bg-brass-bright/80"
      style={{ scaleX: reduced ? scrollYProgress : eased }}
    />
  );
}
