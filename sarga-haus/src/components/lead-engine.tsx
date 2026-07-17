"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { RotateCcw } from "lucide-react";
import { EASE, VIEWPORT } from "@/lib/motion";
import { Reveal } from "./ui";

/**
 * The lead engine as a drawn schematic. Signals enter, one is filtered
 * out at qualification (deliberately: honesty is the aesthetic), the rest
 * become pipeline. Draws once in view; replay is explicit.
 */

const CHAMBERS = [
  { x: 30, label: "Signals" },
  { x: 154, label: "Targeting" },
  { x: 278, label: "Enrichment" },
  { x: 402, label: "Qualification" },
  { x: 526, label: "Pipeline" },
];

const STEPS = [
  ["Market signals", "Hiring, launches, tool churn, manual-workflow evidence. Compliant sources only."],
  ["Targeting and enrichment", "A defined ICP slice, verified contacts, three usable facts before anyone writes a word."],
  ["Qualification", "A scoring rubric decides who gets attention. Most prospects are filtered out on purpose."],
  ["Personalized outreach", "Drafted by the system from approved facts. Sent only after a human signs off."],
  ["Pipeline visibility", "Every conversation staged in the CRM with a next step and a due date. Reported weekly."],
] as const;

function Schematic({ runKey, reduced }: { runKey: number; reduced: boolean }) {
  const draw = (delay: number) => ({
    hidden: { strokeDashoffset: 1 },
    visible: {
      strokeDashoffset: 0,
      transition: { duration: 0.7, ease: EASE, delay },
    },
  });
  const appear = (delay: number) => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: EASE, delay } },
  });

  return (
    <motion.svg
      key={runKey}
      viewBox="0 0 640 230"
      fill="none"
      className="h-auto w-full"
      initial={reduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT}
      aria-hidden="true"
    >
      {CHAMBERS.map((c, i) => (
        <motion.g key={c.label} variants={appear(i * 0.35)}>
          <rect x={c.x} y={70} width="84" height="56" rx="12" stroke="var(--color-t1)" strokeOpacity="0.7" strokeWidth="1.3" />
          <text x={c.x + 42} y={146} textAnchor="middle" fill="var(--color-t3)" fontSize="10" letterSpacing="1.4">
            {c.label.toUpperCase()}
          </text>
        </motion.g>
      ))}
      {CHAMBERS.slice(0, -1).map((c, i) => (
        <motion.path
          key={i}
          d={`M${c.x + 84} 98 H${CHAMBERS[i + 1].x}`}
          stroke="var(--color-t2)"
          strokeWidth="1.2"
          pathLength={1}
          strokeDasharray="1"
          variants={draw(0.25 + i * 0.35)}
        />
      ))}
      {/* three signals enter; one is filtered at qualification */}
      {[86, 98, 110].map((y, i) => (
        <motion.circle
          key={y}
          r="3.5"
          fill={i === 1 ? "var(--color-t3)" : "var(--accent)"}
          initial={reduced ? { opacity: 1, cx: i === 1 ? 444 : 568, cy: i === 1 ? 170 : 98 } : { opacity: 0, cx: 8, cy: y }}
          whileInView={
            reduced
              ? {}
              : i === 1
                ? { opacity: [0, 1, 1, 1, 0.35], cx: [8, 200, 380, 444, 444], cy: [y, y, y, 110, 176] }
                : { opacity: [0, 1, 1, 1], cx: [8, 220, 420, 568], cy: [y, y, y, 98] }
          }
          viewport={VIEWPORT}
          transition={{ duration: 3.2, times: i === 1 ? [0, 0.2, 0.55, 0.7, 1] : [0, 0.25, 0.6, 1], ease: "easeInOut", delay: 1.4 + i * 0.25 }}
        />
      ))}
      <motion.text x="444" y="196" textAnchor="middle" fill="var(--color-t3)" fontSize="9" letterSpacing="1.2" variants={appear(reduced ? 0 : 3.6)}>
        FILTERED OUT, ON PURPOSE
      </motion.text>
    </motion.svg>
  );
}

export function LeadEngine() {
  const reduced = useReducedMotion() ?? false;
  const [runKey, setRunKey] = useState(0);

  return (
    <section data-ground="ink" data-bp="S7 · Lead engine — drawn schematic" className="section-pad bg-ink" id="lead-engine">
      <div className="container-page">
        <div className="max-w-3xl">
          <Reveal>
            <p className="label text-accent">The lead engine</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-m mt-5 text-t1">
              A product without a pipeline is just a project.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="standfirst mt-5 text-t2">
              Sarga Haus builds the thing, and the system that puts it in front
              of the right people. Infrastructure and process, measured weekly.
              We do not promise lead volume, and you should distrust anyone who does.
            </p>
          </Reveal>
        </div>

        <div data-torch className="mt-14 rounded-2xl border border-line bg-raised p-6 md:p-10">
          {/* On small screens the schematic keeps a readable size and pans. */}
          <div className="no-scrollbar -mx-2 overflow-x-auto px-2">
            <div className="min-w-[560px]">
              <Schematic runKey={runKey} reduced={reduced} />
            </div>
          </div>
          <p className="mt-1 text-[0.75rem] text-t3 md:hidden">
            Swipe the schematic to follow the flow.
          </p>
          {!reduced && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                data-cursor-label="Replay"
                onClick={() => setRunKey((k) => k + 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.8125rem] text-t3 transition-colors hover:text-t1"
              >
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />
                Run it again
              </button>
            </div>
          )}
        </div>

        <dl className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(([term, def], i) => (
            <Reveal key={term} delay={i * 0.06}>
              <div className="border-t border-line pt-4">
                <dt className="text-[0.9375rem] font-medium text-t1">{term}</dt>
                <dd className="mt-2 text-[0.875rem] leading-relaxed text-t2">{def}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
