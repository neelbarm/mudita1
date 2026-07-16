"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";

/**
 * Blueprint mode: the site turns itself inside out. Toggling it exposes
 * the working drawing under the page — the 12-column grid, the baseline
 * rhythm, every section labeled with its role, and the live token sheet.
 * A studio that builds systems should be able to show its own.
 * Press B, or use the switch. Desktop only.
 */

const TOKENS = [
  ["Ink", "#0D0C0A"],
  ["Coal", "#161411"],
  ["Bone", "#F2EEE6"],
  ["Paper", "#FAF8F2"],
  ["Cream", "#EDE9E0"],
  ["Brass", "#A98D5F"],
] as const;

const TYPE = [
  ["Display XL", "Fraunces · clamp(2.75–6rem)"],
  ["Display L–S", "Fraunces · fluid steps"],
  ["Body", "Instrument Sans · 16/1.65"],
  ["Label", "Instrument Sans · 11/0.16em caps"],
] as const;

export function Blueprint() {
  const [on, setOn] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle("blueprint", on);
    return () => document.documentElement.classList.remove("blueprint");
  }, [on]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key.toLowerCase() === "b" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setOn((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        data-cursor-label={on ? "Close" : "Reveal"}
        className="fixed bottom-5 left-5 z-[70] hidden min-h-9 items-center gap-2 rounded-full border border-line bg-ink/80 px-4 py-1.5 text-[0.75rem] font-medium tracking-[0.08em] text-cream-dim backdrop-blur-md transition-colors duration-300 hover:border-brass hover:text-cream lg:inline-flex"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
            on ? "bg-brass-bright" : "bg-cream-faint"
          }`}
          aria-hidden="true"
        />
        {on ? "Exit blueprint" : "Blueprint"}
        <kbd className="ml-1 rounded border border-line px-1.5 py-0.5 text-[0.625rem] text-cream-faint">
          B
        </kbd>
      </button>

      <AnimatePresence>
        {on && (
          <motion.div
            key="bp"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            aria-hidden="true"
          >
            {/* 12-column working grid */}
            <div className="pointer-events-none fixed inset-0 z-[60]">
              <div className="container-page flex h-full gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full flex-1 border-x border-brass/15 bg-brass/[0.025]"
                  />
                ))}
              </div>
            </div>
            {/* baseline rhythm */}
            <div
              className="pointer-events-none fixed inset-0 z-[60]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(169,141,95,0.16) 0 1px, transparent 1px 8px)",
                opacity: 0.35,
                maskImage: "linear-gradient(to bottom, transparent, black 8%)",
              }}
            />
            {/* token sheet */}
            <div className="fixed bottom-5 right-5 z-[70] w-64 rounded-xl border border-brass/40 bg-ink/90 p-4 backdrop-blur-md">
              <p className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-brass-bright">
                Form — working drawing
              </p>
              <div className="mt-3 grid grid-cols-6 gap-1.5">
                {TOKENS.map(([name, hex]) => (
                  <div key={name} title={`${name} ${hex}`}>
                    <div
                      className="h-6 w-full rounded border border-cream/15"
                      style={{ backgroundColor: hex }}
                    />
                    <p className="mt-1 text-center text-[0.5rem] text-cream-faint">{name}</p>
                  </div>
                ))}
              </div>
              <dl className="mt-3 space-y-1.5 border-t border-cream/10 pt-3">
                {TYPE.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-[0.625rem]">
                    <dt className="shrink-0 text-cream-dim">{k}</dt>
                    <dd className="text-right text-cream-faint">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-3 text-[0.625rem]">
                  <dt className="text-cream-dim">Grid</dt>
                  <dd className="text-cream-faint">12 col · 24 gutter · 4 base</dd>
                </div>
                <div className="flex justify-between gap-3 text-[0.625rem]">
                  <dt className="text-cream-dim">Easing</dt>
                  <dd className="text-cream-faint">cubic-bezier(.22, 1, .36, 1)</dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-cream/10 pt-2.5 text-[0.625rem] leading-relaxed text-cream-faint">
                This is the site&apos;s own design system, live. Every project
                ships with its working drawing.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
