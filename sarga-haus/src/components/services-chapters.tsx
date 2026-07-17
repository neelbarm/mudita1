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
    // The div wrapper carries the torch; pseudo-elements cannot attach
    // to the svg itself.
    <div data-torch className="rounded-2xl">
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
    </div>
  );
}

/* 01 Validation: a rough idea resolves into a mapped, structured plan. */
function ValidationVisual() {
  // faint scattered marks (the raw idea) beside a clean branching map
  const scatter = [
    [48, 48], [86, 40], [44, 150], [118, 162],
  ] as const;
  const nodes = [
    { cy: 50, brass: false },
    { cy: 96, brass: true },
    { cy: 142, brass: false },
  ] as const;
  return (
    <VisualFrame>
      {scatter.map(([x, y], i) => (
        <motion.line
          key={i}
          x1={x}
          y1={y}
          x2={x + 12}
          y2={y}
          stroke="var(--color-t3)"
          strokeWidth="1.1"
          transform={`rotate(${(i * 57) % 90 - 30} ${x} ${y})`}
          variants={appear(i * 0.07)}
        />
      ))}
      <motion.circle cx="60" cy="96" r="6" stroke="var(--color-t1)" strokeWidth="1.4" variants={appear(0.35)} />
      <motion.path d="M66 96 C 118 96, 130 50, 174 50" stroke="var(--color-t2)" strokeWidth="1.2" pathLength={1} strokeDasharray="1" variants={draw(0.5)} />
      <motion.path d="M66 96 H 174" stroke="var(--color-t2)" strokeWidth="1.2" pathLength={1} strokeDasharray="1" variants={draw(0.6)} />
      <motion.path d="M66 96 C 118 96, 130 142, 174 142" stroke="var(--color-t2)" strokeWidth="1.2" pathLength={1} strokeDasharray="1" variants={draw(0.7)} />
      {nodes.map((n, i) => (
        <motion.g key={i} variants={appear(0.95 + i * 0.12)}>
          <rect
            x="174"
            y={n.cy - 15}
            width="64"
            height="30"
            rx="7"
            fill={n.brass ? "var(--accent)" : "var(--raised)"}
            fillOpacity={n.brass ? 0.12 : 1}
            stroke={n.brass ? "var(--accent)" : "var(--color-t1)"}
            strokeOpacity={n.brass ? 1 : 0.8}
            strokeWidth="1.3"
          />
          <line x1="184" y1={n.cy - 5} x2="222" y2={n.cy - 5} stroke={n.brass ? "var(--accent)" : "var(--color-t2)"} strokeWidth="1.1" />
          <line x1="184" y1={n.cy + 5} x2="212" y2={n.cy + 5} stroke="var(--color-t3)" strokeWidth="1.1" />
        </motion.g>
      ))}
      <motion.text x="24" y="201" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.4)}>
        SCOPE, MAPPED
      </motion.text>
    </VisualFrame>
  );
}

/* 02 Build: a dashed wireframe becomes a working product screen. */
function BuildVisual() {
  return (
    <VisualFrame>
      <motion.rect x="48" y="30" width="224" height="140" rx="12" stroke="var(--color-t3)" strokeDasharray="4 5" strokeWidth="1.1" variants={appear(0)} />
      <motion.rect x="48" y="30" width="224" height="140" rx="12" fill="var(--raised)" stroke="var(--color-t1)" strokeOpacity="0.85" strokeWidth="1.3" pathLength={1} strokeDasharray="1" variants={draw(0.3)} />
      {/* window chrome + panel dividers */}
      <motion.g variants={appear(0.7)}>
        <circle cx="64" cy="46" r="2.5" stroke="var(--color-t3)" strokeWidth="1" />
        <circle cx="74" cy="46" r="2.5" stroke="var(--color-t3)" strokeWidth="1" />
        <line x1="48" y1="60" x2="272" y2="60" stroke="var(--color-t1)" strokeOpacity="0.22" strokeWidth="1" />
        <line x1="104" y1="60" x2="104" y2="170" stroke="var(--color-t1)" strokeOpacity="0.22" strokeWidth="1" />
      </motion.g>
      {/* sidebar nav, one item active */}
      <motion.g variants={appear(0.85)}>
        <line x1="62" y1="78" x2="92" y2="78" stroke="var(--color-t2)" strokeWidth="1.1" />
        <line x1="62" y1="94" x2="86" y2="94" stroke="var(--color-t2)" strokeWidth="1.1" />
        <line x1="62" y1="110" x2="90" y2="110" stroke="var(--accent)" strokeWidth="1.3" />
        <line x1="62" y1="126" x2="82" y2="126" stroke="var(--color-t2)" strokeWidth="1.1" />
      </motion.g>
      {/* main: heading, content rows, action, live chart */}
      <motion.line x1="118" y1="78" x2="196" y2="78" stroke="var(--color-t1)" strokeWidth="1.3" variants={appear(1.0)} />
      <motion.line x1="118" y1="96" x2="250" y2="96" stroke="var(--color-t2)" strokeWidth="1.1" variants={appear(1.08)} />
      <motion.line x1="118" y1="108" x2="226" y2="108" stroke="var(--color-t2)" strokeWidth="1.1" variants={appear(1.16)} />
      <motion.g variants={appear(1.24)}>
        <rect x="118" y="122" width="60" height="16" rx="8" fill="var(--accent)" fillOpacity="0.16" stroke="var(--accent)" strokeWidth="1.3" />
        <line x1="130" y1="130" x2="166" y2="130" stroke="var(--accent)" strokeWidth="1.2" />
      </motion.g>
      <motion.path d="M118 158 L142 150 L166 154 L190 142 L216 146 L248 132" stroke="var(--accent)" strokeWidth="1.3" pathLength={1} strokeDasharray="1" variants={draw(1.35)} />
      <motion.text x="24" y="201" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.6)}>
        WIREFRAME TO WORKING
      </motion.text>
    </VisualFrame>
  );
}

/* 03 Automation: tangled manual work converges into one governed flow. */
function AutomationVisual() {
  return (
    <VisualFrame>
      {/* three tangled manual lanes converging to a single junction */}
      <motion.path d="M32 58 C 58 44, 84 74, 116 88" stroke="var(--color-t3)" strokeWidth="1.1" variants={appear(0)} />
      <motion.path d="M32 88 C 62 100, 86 76, 116 88" stroke="var(--color-t3)" strokeWidth="1.1" variants={appear(0.1)} />
      <motion.path d="M32 118 C 58 132, 84 102, 116 88" stroke="var(--color-t3)" strokeWidth="1.1" variants={appear(0.2)} />
      <motion.circle cx="116" cy="88" r="4" fill="var(--raised)" stroke="var(--color-t1)" strokeWidth="1.3" variants={appear(0.4)} />
      {/* one governed pipeline */}
      <motion.path d="M120 88 H 286" stroke="var(--color-t1)" strokeWidth="1.3" pathLength={1} strokeDasharray="1" variants={draw(0.5)} />
      <motion.rect x="140" y="76" width="30" height="24" rx="6" fill="var(--raised)" stroke="var(--color-t1)" strokeOpacity="0.8" strokeWidth="1.3" variants={appear(0.95)} />
      {/* the human approval gate */}
      <motion.g variants={appear(1.1)}>
        <rect x="194" y="76" width="24" height="24" rx="4" transform="rotate(45 206 88)" fill="var(--accent)" fillOpacity="0.14" stroke="var(--accent)" strokeWidth="1.3" />
        <path d="M200 88 l4 5 l8 -9" stroke="var(--accent)" strokeWidth="1.4" />
      </motion.g>
      <motion.rect x="242" y="76" width="30" height="24" rx="6" fill="var(--raised)" stroke="var(--color-t1)" strokeOpacity="0.8" strokeWidth="1.3" variants={appear(1.25)} />
      <motion.path d="M286 88 h12 m-5 -4 l5 4 l-5 4" stroke="var(--accent)" strokeWidth="1.3" variants={appear(1.4)} />
      <motion.text x="24" y="201" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.55)}>
        ONE FLOW, ONE APPROVAL POINT
      </motion.text>
    </VisualFrame>
  );
}

/* 04 Pipeline: scattered market signals funnel into a qualified list. */
function PipelineVisual() {
  const signals = [
    [40, 44], [72, 58], [44, 92], [78, 112], [38, 134], [66, 150],
  ] as const;
  const rows = [
    { y: 80, w: 64 },
    { y: 100, w: 54 },
    { y: 120, w: 60 },
  ] as const;
  return (
    <VisualFrame>
      {signals.map(([x, y], i) => (
        <motion.line
          key={i}
          x1={x}
          y1={y}
          x2={x + 12}
          y2={y}
          stroke="var(--color-t3)"
          strokeWidth="1.1"
          transform={`rotate(${(i * 49) % 110 - 45} ${x} ${y})`}
          variants={appear(i * 0.06)}
        />
      ))}
      {/* funnel narrowing the field to what qualifies */}
      <motion.path d="M104 54 L176 94 L176 106 L104 146" stroke="var(--color-t2)" strokeWidth="1.2" pathLength={1} strokeDasharray="1" variants={draw(0.5)} />
      <motion.path d="M176 94 H 192 M176 106 H 192" stroke="var(--color-t2)" strokeWidth="1.2" variants={appear(0.85)} />
      {/* the qualified, ordered list */}
      {rows.map((r, i) => (
        <motion.g key={i} variants={appear(1.0 + i * 0.14)}>
          <line x1="200" y1={r.y} x2={200 + r.w} y2={r.y} stroke="var(--color-t1)" strokeOpacity="0.75" strokeWidth="1.2" />
          <path d={`M276 ${r.y - 4} l4 5 l7 -8`} stroke="var(--accent)" strokeWidth="1.4" />
        </motion.g>
      ))}
      <motion.text x="24" y="201" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.5)}>
        SIGNALS, QUALIFIED
      </motion.text>
    </VisualFrame>
  );
}

/* 05 Growth: measured results compound upward, step by step. */
function GrowthVisual() {
  const markers = [
    [96, 128], [150, 104], [204, 74],
  ] as const;
  return (
    <VisualFrame>
      {/* faint measurement grid */}
      <motion.g variants={appear(0.1)}>
        <line x1="46" y1="160" x2="276" y2="160" stroke="var(--color-t1)" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="46" y1="118" x2="276" y2="118" stroke="var(--color-t1)" strokeOpacity="0.1" strokeWidth="1" />
        <line x1="46" y1="78" x2="276" y2="78" stroke="var(--color-t1)" strokeOpacity="0.1" strokeWidth="1" />
      </motion.g>
      {/* area under the compounding line */}
      <motion.path d="M46 160 L46 150 L96 150 L96 128 L150 128 L150 104 L204 104 L204 74 L262 74 L262 160 Z" fill="var(--accent)" fillOpacity="0.11" stroke="none" variants={appear(0.95)} />
      {/* the step line: each level held, then raised */}
      <motion.path d="M46 150 H96 V128 H150 V104 H204 V74 H262" stroke="var(--color-t1)" strokeWidth="1.5" pathLength={1} strokeDasharray="1" variants={draw(0.3)} />
      {markers.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="3.5" fill="var(--raised)" stroke="var(--accent)" strokeWidth="1.3" variants={appear(0.95 + i * 0.15)} />
      ))}
      <motion.circle cx="262" cy="74" r="4" fill="var(--accent)" variants={appear(1.45)} />
      <motion.text x="24" y="201" fill="var(--color-t3)" fontSize="10" letterSpacing="1.6" variants={appear(1.55)}>
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
