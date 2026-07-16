"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";
import { Reveal } from "./ui";

/**
 * Before/after as a two-state machine. The same operation, twice:
 * once scattered across inboxes and memory, once as a governed flow
 * with a human approval point. No robots, no cliches.
 */

const BEFORE = [
  { label: "Enquiry in DMs", x: "6%", y: "12%", r: -4 },
  { label: "Spreadsheet v14 (final)", x: "52%", y: "6%", r: 3 },
  { label: "Follow-up on a sticky note", x: "16%", y: "48%", r: -2 },
  { label: "Invoice chased by memory", x: "60%", y: "42%", r: 5 },
  { label: "Proposal in someone's drafts", x: "32%", y: "74%", r: -5 },
  { label: "Lead went quiet, nobody noticed", x: "62%", y: "78%", r: 2 },
];

const AFTER = ["Intake", "CRM", "Automations", "Human approval", "Report"];

export function AutomationToggle() {
  const [state, setState] = useState<"before" | "after">("before");
  const reduced = useReducedMotion();

  return (
    <section data-ground="bone" className="section-pad bg-bone" id="automation">
      <div className="container-page">
        <div className="max-w-3xl">
          <Reveal>
            <p className="label text-accent">Automation</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-m mt-5 text-t1">Stop operating the business by hand.</h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="standfirst mt-5 text-t2">
              The same operation, shown twice. Same enquiries, same clients,
              same money. Different system.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div
            role="group"
            aria-label="Toggle between the manual and automated operation"
            className="mt-10 inline-flex rounded-full border border-line-strong p-1"
          >
            {(["before", "after"] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={state === s}
                onClick={() => setState(s)}
                className={`relative min-h-10 rounded-full px-5 text-[0.875rem] transition-colors duration-300 ${
                  state === s ? "text-ground" : "text-t2 hover:text-t1"
                }`}
              >
                {state === s && (
                  <motion.span
                    layoutId="auto-pill"
                    className="absolute inset-0 rounded-full bg-t1"
                    transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
                  />
                )}
                <span className="relative">{s === "before" ? "By hand" : "With a system"}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="relative mt-8 h-96 overflow-hidden rounded-2xl border border-line bg-raised md:h-80">
          <AnimatePresence mode="wait">
            {state === "before" ? (
              <motion.div
                key="before"
                className="absolute inset-0"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {BEFORE.map((item, i) => (
                  <motion.span
                    key={item.label}
                    className="absolute rounded-lg border border-line bg-ground px-3 py-2 text-[0.8125rem] text-t2 shadow-sm"
                    style={{ left: item.x, top: item.y, rotate: item.r }}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE, delay: reduced ? 0 : i * 0.06 }}
                  >
                    {item.label}
                  </motion.span>
                ))}
                <p className="absolute bottom-5 left-5 max-w-md pr-5 text-[0.875rem] text-t3">
                  Six tools, zero owners. Every dropped lead here is silent.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="after"
                className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-0">
                  {AFTER.map((step, i) => (
                    <div key={step} className="flex items-center">
                      <motion.span
                        className={`rounded-lg border px-4 py-2.5 text-[0.875rem] ${
                          step === "Human approval"
                            ? "border-accent text-accent"
                            : "border-line-strong text-t1"
                        }`}
                        initial={reduced ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: EASE, delay: reduced ? 0 : i * 0.1 }}
                      >
                        {step}
                      </motion.span>
                      {i < AFTER.length - 1 && (
                        <motion.span
                          aria-hidden="true"
                          className="mx-1 hidden h-px w-6 bg-line-strong md:block"
                          initial={reduced ? false : { scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, ease: EASE, delay: reduced ? 0 : 0.1 + i * 0.1 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <p className="max-w-md text-center text-[0.875rem] text-t3">
                  One flow. Every enquiry lands, every follow-up fires, every
                  exception waits for a person, and Friday's report writes itself.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
