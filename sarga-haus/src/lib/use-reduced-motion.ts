"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe reduced-motion hook: returns false on the server and on the
 * first client render (so hydration always matches), then reflects the
 * real media query. Structural motion decisions key off this; framer's
 * own animations additionally respect MotionConfig reducedMotion="user".
 */
export function useReducedMotionSafe() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
