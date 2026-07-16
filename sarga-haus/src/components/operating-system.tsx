"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";
import { Reveal } from "./ui";

/**
 * The Sarga Haus operating system as an interactive walkthrough.
 * Accessible tabs: arrow keys move, Home/End jump, panels announced.
 */

const STAGES = [
  {
    id: "clarify",
    name: "Clarify",
    happens: "We interrogate the idea or the broken workflow until the real problem is on the table. Most projects change shape here, on paper, where change is cheap.",
    delivered: "A written brief: the problem, the user, the offer, the scope line, and what we are deliberately not building.",
    changes: "You stop guessing. There is one agreed definition of done.",
    service: "Validation Sprint",
  },
  {
    id: "build",
    name: "Build",
    happens: "The system gets built in weekly, visible increments: interface, data, logic, integrations. You see working software every week, not a status report.",
    delivered: "A working product or internal system on a stack you own, with clean handover and no lock-in.",
    changes: "The idea exists. People can use it, react to it, pay for it.",
    service: "Build Sprint",
  },
  {
    id: "automate",
    name: "Automate",
    happens: "We map every repetitive motion in the operation and wire it into one flow: intake, follow-ups, handoffs, reporting. AI where it earns its place, human approval where judgment matters.",
    delivered: "Running automations, a CRM that maintains itself, dashboards that tell the truth.",
    changes: "Hours come back. Nothing depends on your memory anymore.",
    service: "Automation Sprint",
  },
  {
    id: "acquire",
    name: "Acquire",
    happens: "We build the demand machinery: targeting, list building, enrichment, sequenced outreach with human sign-off, and pipeline stages that force a next step.",
    delivered: "A lead engine: compliant data flow, outreach infrastructure, CRM motion, weekly pipeline reporting.",
    changes: "Qualified conversations arrive on a system, not on luck.",
    service: "Pipeline Sprint",
  },
  {
    id: "improve",
    name: "Improve",
    happens: "We measure what the system actually does, then ship the next most valuable improvement each month. The roadmap follows evidence, not opinion.",
    delivered: "Monthly shipped improvements, quarterly system audits, a backlog ranked by impact.",
    changes: "The system compounds instead of decaying.",
    service: "Growth Partnership",
  },
];

export function OperatingSystem() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (active + 1) % STAGES.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (active - 1 + STAGES.length) % STAGES.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = STAGES.length - 1;
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      tabsRef.current[next]?.focus();
    }
  };

  const stage = STAGES[active];

  return (
    <section data-ground="bone" data-bp="S6 · Operating system — accessible tablist" className="section-pad bg-bone" id="system">
      <div className="container-page">
        <div className="max-w-3xl">
          <Reveal>
            <p className="label text-accent">The operating system</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-m mt-5 text-t1">
              One system, five stages. This is how the work runs.
            </h2>
          </Reveal>
        </div>

        <div
          role="tablist"
          aria-label="Sarga Haus operating system stages"
          className="mt-12 flex flex-wrap gap-x-2 gap-y-3 border-b border-line"
          onKeyDown={onKeyDown}
        >
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => {
                tabsRef.current[i] = el;
              }}
              role="tab"
              id={`os-tab-${s.id}`}
              aria-selected={i === active}
              aria-controls={`os-panel-${s.id}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={`relative min-h-11 px-4 pb-3 pt-2 text-[0.9375rem] transition-colors duration-300 ${
                i === active ? "font-medium text-t1" : "text-t2 hover:text-t1"
              }`}
            >
              <span className="mr-2 text-[0.75rem] text-t3">0{i + 1}</span>
              {s.name}
              {i === active && (
                <motion.span
                  layoutId="os-indicator"
                  className="absolute inset-x-2 -bottom-px h-0.5 bg-accent"
                  transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="relative mt-10 min-h-72">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              role="tabpanel"
              id={`os-panel-${stage.id}`}
              aria-labelledby={`os-tab-${stage.id}`}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="grid gap-10 md:grid-cols-12"
            >
              <div className="md:col-span-5">
                <h3 className="display-s text-t1">{stage.name}</h3>
                <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-t2">
                  {stage.happens}
                </p>
              </div>
              <dl className="space-y-6 md:col-span-6 md:col-start-7">
                <div className="border-t border-line pt-4">
                  <dt className="label text-t3">What you get</dt>
                  <dd className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{stage.delivered}</dd>
                </div>
                <div className="border-t border-line pt-4">
                  <dt className="label text-t3">What changes</dt>
                  <dd className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{stage.changes}</dd>
                </div>
                <div className="border-t border-line pt-4">
                  <dt className="label text-t3">Maps to</dt>
                  <dd className="mt-2 text-[0.9375rem] font-medium text-accent">{stage.service}</dd>
                </div>
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
