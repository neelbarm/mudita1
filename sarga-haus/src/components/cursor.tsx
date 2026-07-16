"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";

/**
 * The studio cursor: a brass point that tracks the hand, and a hairline
 * ring that follows with physical lag. Over interactive elements the
 * ring opens; elements can name the action via data-cursor-label.
 * Fine pointers only; disabled under reduced motion; native cursor
 * returns over text fields.
 */
export function Cursor() {
  const reduced = useReducedMotionSafe();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState<"idle" | "hover" | "label" | "hidden">("idle");
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine && !reduced);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("has-cursor");
      return;
    }
    document.documentElement.classList.add("has-cursor");

    let x = -100, y = -100;      // pointer
    let rx = -100, ry = -100;    // ring (lagged)
    let raf = 0;
    let seen = false;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        rx = x; ry = y; seen = true;
      }
    };

    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (!el || !(el instanceof Element)) return;
      if (el.closest("input, textarea, select")) {
        setMode("hidden");
        setLabel("");
        return;
      }
      const labelled = el.closest("[data-cursor-label]");
      if (labelled) {
        setLabel(labelled.getAttribute("data-cursor-label") || "");
        setMode("label");
        return;
      }
      if (el.closest("a, button, [role='tab'], label, summary")) {
        setMode("hover");
        setLabel("");
        return;
      }
      setMode("idle");
      setLabel("");
    };

    const onLeave = () => {
      x = -100; y = -100;
    };

    const tick = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const hidden = mode === "hidden";
  const size = mode === "label" ? 64 : mode === "hover" ? 40 : 26;

  return (
    <div aria-hidden="true">
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-brass-bright transition-opacity duration-200"
        style={{ opacity: hidden ? 0 : 1 }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full border border-brass-bright/60 transition-[width,height,opacity,background-color] duration-300 ease-out"
        style={{
          width: size,
          height: size,
          opacity: hidden ? 0 : 1,
          backgroundColor: mode === "label" ? "rgba(13,12,10,0.55)" : "transparent",
          backdropFilter: mode === "label" ? "blur(2px)" : undefined,
        }}
      >
        {mode === "label" && (
          <span className="select-none text-[9px] font-medium uppercase tracking-[0.16em] text-cream">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
