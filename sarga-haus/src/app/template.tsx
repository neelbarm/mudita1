"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";

/**
 * Route veil: every navigation opens on a beat of ink that lifts,
 * with a brass hairline at its trailing edge. Cheap, cinematic,
 * and skipped entirely under reduced motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotionSafe();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {children}
      {!gone && !reduced && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[85]"
          initial={{ y: 0 }}
          animate={{ y: "-100.5%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.06 }}
        >
          <div className="absolute inset-0 bg-ink" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-brass-bright/70" />
        </motion.div>
      )}
    </>
  );
}
