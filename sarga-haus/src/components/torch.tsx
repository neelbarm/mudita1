"use client";

import { useEffect } from "react";

/**
 * The torch: every surface tagged [data-torch] carries a warm pool of
 * light that follows the pointer, plus a lit seam along its border.
 * One rAF-throttled listener drives them all through custom properties;
 * the paint itself lives in globals.css. Fine pointers only.
 */
export function Torch() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const R = 190; // influence reach beyond a surface's edge, px
    let px = -1e4;
    let py = -1e4;
    let scheduled = false;

    const apply = () => {
      scheduled = false;
      const els = document.querySelectorAll<HTMLElement>("[data-torch]");
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -R || r.top > window.innerHeight + R || r.width === 0) {
          if (el.style.getPropertyValue("--to") !== "0") el.style.setProperty("--to", "0");
          continue;
        }
        const x = px - r.left;
        const y = py - r.top;
        if (x < -R || x > r.width + R || y < -R || y > r.height + R) {
          if (el.style.getPropertyValue("--to") !== "0") el.style.setProperty("--to", "0");
          continue;
        }
        const dx = Math.max(-x, x - r.width, 0);
        const dy = Math.max(-y, y - r.height, 0);
        const s = Math.max(0, 1 - Math.hypot(dx, dy) / R);
        el.style.setProperty("--tx", `${x.toFixed(1)}px`);
        el.style.setProperty("--ty", `${y.toFixed(1)}px`);
        el.style.setProperty("--to", s.toFixed(3));
      }
    };

    const schedule = () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(apply);
      }
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    const onLeave = () => {
      px = -1e4;
      py = -1e4;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
