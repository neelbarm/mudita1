"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE, VIEWPORT } from "@/lib/motion";
import { Reveal, InlineLink } from "./ui";

/**
 * Five offers as editorial chapters, each with its own visual mechanism.
 * Layouts alternate so the rhythm never repeats. See docs/03 §S4.
 */

const draw = (delay = 0) => ({
  hidden: { strokeDashoffset: 1 },
  visible: {
    strokeDashoffset: 0,
    transition: { duration: 0.9, ease: EASE, delay },
  },
});

const appear = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE, delay } },
});

function VisualFrame({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 320 220"
      fill="none"
      className="h-auto w-full rounded-2xl border border-line bg-raised"
      initial={reduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT}
      aria-hidden="true"
    >
      {children}
    </motion.svg>
  );
}

/* 01 Validation: scattered notes resolve into a mapped route. */
function ValidationVisual() {
  const dots = [
    [60, 60], [120, 150], [210, 55], [260, 130], [160, 100],
  ] as const;
  return (
    <VisualFrame>
      {dots.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="3" stroke="var(--color-t2)" strokeWidth="1.2" variants={appear(i * 0.08)} />
      ))}
      <motion.path
        d="M60 60 L160 100 L120 150 M160 100 L210 55 L260 130"
        stroke="var(--accent)"
        strokeWidth="1.2"
        pathLength={1}
        strokeDasharray="1"
        variants={draw(0.5)}
      />
      <motion.text x="60" y="192" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.2)}>
        SCOPE MAPPED
      </motion.text>
    </VisualFrame>
  );
}

/* 02 Build: a wireframe becomes a finished surface. */
function BuildVisual() {
  return (
    <VisualFrame>
      <motion.rect x="70" y="35" width="180" height="130" rx="10" stroke="var(--color-t3)" strokeDasharray="4 5" strokeWidth="1.1" variants={appear(0)} />
      <motion.rect x="70" y="35" width="180" height="130" rx="10" stroke="var(--color-t1)" strokeWidth="1.3" pathLength={1} strokeDasharray="1" variants={draw(0.35)} />
      <motion.line x1="90" y1="65" x2="230" y2="65" stroke="var(--color-t2)" strokeWidth="1.1" variants={appear(0.9)} />
      <motion.line x1="90" y1="92" x2="196" y2="92" stroke="var(--color-t2)" strokeWidth="1.1" variants={appear(1.0)} />
      <motion.line x1="90" y1="112" x2="212" y2="112" stroke="var(--color-t2)" strokeWidth="1.1" variants={appear(1.1)} />
      <motion.rect x="90" y="130" width="64" height="18" rx="9" stroke="var(--accent)" strokeWidth="1.3" variants={appear(1.25)} />
      <motion.text x="70" y="192" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.5)}>
        WIREFRAME TO WORKING
      </motion.text>
    </VisualFrame>
  );
}

/* 03 Automation: three manual lanes compress into one governed flow. */
function AutomationVisual() {
  return (
    <VisualFrame>
      {[48, 78, 108].map((y, i) => (
        <motion.path
          key={y}
          d={`M40 ${y} q 30 ${i % 2 ? 14 : -14} 60 0 t 60 0`}
          stroke="var(--color-t3)"
          strokeWidth="1.1"
          variants={appear(i * 0.1)}
        />
      ))}
      <motion.path d="M40 160 H236" stroke="var(--color-t1)" strokeWidth="1.4" pathLength={1} strokeDasharray="1" variants={draw(0.5)} />
      <motion.circle cx="160" cy="160" r="7" stroke="var(--accent)" strokeWidth="1.4" variants={appear(1.2)} />
      <motion.path d="M236 160 h 26" stroke="var(--accent)" strokeWidth="1.4" variants={appear(1.35)} />
      <motion.text x="40" y="196" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.5)}>
        ONE FLOW, ONE APPROVAL POINT
      </motion.text>
    </VisualFrame>
  );
}

/* 04 Pipeline: scattered signals become a ranked, qualified list. */
function PipelineVisual() {
  const ticks = [52, 82, 112] as const;
  return (
    <VisualFrame>
      {[[52, 46], [88, 96], [66, 140], [104, 62]].map(([x, y], i) => (
        <motion.line key={i} x1={x} y1={y} x2={x + 14} y2={y} stroke="var(--color-t3)" strokeWidth="1.2" transform={`rotate(${i * 38} ${x} ${y})`} variants={appear(i * 0.08)} />
      ))}
      {ticks.map((y, i) => (
        <motion.g key={y} variants={appear(0.5 + i * 0.15)}>
          <line x1="150" y1={y} x2={244 - i * 22} y2={y} stroke="var(--color-t2)" strokeWidth="1.2" />
          <path d={`M256 ${y - 4} l4 5 l7 -8`} stroke="var(--accent)" strokeWidth="1.4" />
        </motion.g>
      ))}
      <motion.text x="150" y="192" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.2)}>
        QUALIFIED, IN ORDER
      </motion.text>
    </VisualFrame>
  );
}

/* 05 Growth: a stepped line keeps finding the next level. */
function GrowthVisual() {
  return (
    <VisualFrame>
      <motion.path
        d="M46 170 H100 V140 H150 V104 H204 V66 H262"
        stroke="var(--color-t1)"
        strokeWidth="1.4"
        pathLength={1}
        strokeDasharray="1"
        variants={draw(0.2)}
      />
      {[[100, 140], [150, 104], [204, 66]].map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="3.5" stroke="var(--accent)" strokeWidth="1.3" variants={appear(0.8 + i * 0.15)} />
      ))}
      <motion.text x="46" y="196" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.3)}>
        MEASURED, THEN IMPROVED
      </motion.text>
    </VisualFrame>
  );
}

export const SERVICES = [
  {
    slug: "validation-sprint",
    index: "01",
    name: "Validation Sprint",
    lede: "A rough idea becomes a sharp, buildable plan.",
    body: "Before anything gets built, the idea gets pressure-tested. We map the workflow, cut the scope to what earns its place, define the offer, and leave you with a plan a builder can execute against, whether that builder is us or not.",
    Visual: ValidationVisual,
  },
  {
    slug: "build-sprint",
    index: "02",
    name: "Build Sprint",
    lede: "A working product, not a deck about one.",
    body: "MVPs, client portals, internal tools, dashboards, workflow systems. Built in weeks on a modern stack you own outright, shipped in weekly increments you can see and use.",
    Visual: BuildVisual,
  },
  {
    slug: "automation-sprint",
    index: "03",
    name: "Automation Sprint",
    lede: "The operation stops depending on your memory.",
    body: "Intake, follow-ups, handoffs, reporting, CRM hygiene. We wire the repetitive work into one governed flow, with AI where it earns its place and a human approval point where judgment matters.",
    Visual: AutomationVisual,
  },
  {
    slug: "pipeline-sprint",
    index: "04",
    name: "Pipeline Sprint",
    lede: "Infrastructure that puts the work in front of the right people.",
    body: "Targeted prospect lists, enrichment, segmentation, outreach sequences with human approval, CRM stages, and follow-up logic. We build the machinery and the discipline. We do not sell lead volume.",
    Visual: PipelineVisual,
  },
  {
    slug: "growth-partnership",
    index: "05",
    name: "Growth Partnership",
    lede: "The system keeps getting better after launch.",
    body: "A monthly partnership: maintain, measure, automate further, and ship the next most valuable thing. Each quarter has to re-earn the retainer.",
    Visual: GrowthVisual,
  },
];

export function ServicesChapters() {
  return (
    <section data-ground="bone" data-bp="S4 · Service chapters — editorial spreads" className="section-pad bg-bone" id="services">
      <div className="container-page">
        <div className="max-w-3xl">
          <Reveal>
            <p className="label text-accent">What we do</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-m mt-5 text-t1">
              Five ways in. One system out.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="standfirst mt-5 text-t2">
              These are not five services. They are five stages of the same
              system. Start where your business actually is.
            </p>
          </Reveal>
        </div>

        <div className="mt-8 md:mt-4">
          {SERVICES.map((s, i) => (
            <article
              key={s.slug}
              className="chapter-pad grid grid-cols-1 items-center gap-10 border-b border-line last:border-b-0 md:grid-cols-12 md:gap-6"
            >
              <div
                className={`md:col-span-5 ${i % 2 ? "md:order-2 md:col-start-8" : ""}`}
              >
                <Reveal>
                  <p className="font-display text-[3.5rem] leading-none text-t3" style={{ fontWeight: 380 }}>
                    {s.index}
                  </p>
                </Reveal>
                <Reveal delay={0.06}>
                  <h3 className="display-s mt-4 text-t1">{s.name}</h3>
                </Reveal>
                <Reveal delay={0.12}>
                  <p className="serif-italic mt-3 text-[1.15rem] text-t2">{s.lede}</p>
                </Reveal>
                <Reveal delay={0.18}>
                  <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-t2">
                    {s.body}
                  </p>
                </Reveal>
                <Reveal delay={0.24} className="mt-6">
                  <InlineLink href={`/services#${s.slug}`}>Full scope</InlineLink>
                </Reveal>
              </div>
              <div
                className={`md:col-span-6 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7"}`}
              >
                <s.Visual />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
