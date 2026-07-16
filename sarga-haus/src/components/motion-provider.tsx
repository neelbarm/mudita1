"use client";

import { MotionConfig } from "framer-motion";

/**
 * Global motion policy: users who prefer reduced motion get opacity-only
 * transitions; transforms and layout animations are skipped automatically.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
