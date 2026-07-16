"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";

/**
 * The core narrative, made visible: one object transforms through four
 * stages as the user scrolls. Desktop pins the scene; mobile and reduced
 * motion get the same four stages as composed static panels.
 */

const STAGES = [
  {
    index: "01",
    name: "Idea",
    title: "It starts unformed.",
    body: "Notes, screenshots, a spreadsheet that almost works. The opportunity is real. The shape is not.",
  },
  {
    index: "02",
    name: "Product",
    title: "We give it form.",
    body: "Scope cut to what matters, then a working product: interface, data, logic. Something you can put in front of a real user.",
  },
  {
    index: "03",
    name: "Automation",
    title: "The system runs itself.",
    body: "Intake, follow-ups, handoffs, reporting. The operation moves without you pushing every piece by hand.",
  },
  {
    index: "04",
    name: "Pipeline",
    title: "Then it finds its people.",
    body: "Targeting, enrichment, outreach infrastructure, CRM motion. Qualified attention, visible in one place.",
  },
];

type Num = number | MotionValue<number>;

// Deterministic scatter for the idea fragments.
const IDEA_FRAGS = Array.from({ length: 20 }, (_, i) => {
  const a = i * 2.399963; // golden angle
  const r = 90 + ((i * 53) % 140);
  return {
    x: 320 + Math.cos(a) * r * 1.35,
    y: 280 + Math.sin(a) * r,
    rot: (i * 47) % 360,
    len: 14 + ((i * 29) % 22),
    dot: i % 4 === 0,
  };
});

const ROWS = [
  { y: 210, w: 220 },
  { y: 250, w: 250 },
  { y: 290, w: 190 },
];

const CONDUITS = [
  "M490 190 H535 V150 H574",
  "M490 280 H574",
  "M490 370 H535 V410 H574",
];

const PIPE_ROWS = [
  { y: 214, w: 150, brass: true },
  { y: 252, w: 180, brass: false },
  { y: 290, w: 130, brass: true },
  { y: 328, w: 165, brass: false },
];

function Scene({
  ideaO,
  frameO,
  frameScale,
  autoO,
  autoDashoffset,
  pipeO,
  pipeX,
}: {
  ideaO: Num;
  frameO: Num;
  frameScale: Num;
  autoO: Num;
  /** strokeDashoffset for the conduits: 1 = hidden, 0 = fully drawn. */
  autoDashoffset: Num;
  pipeO: Num;
  pipeX: Num;
}) {
  return (
    <svg
      viewBox="0 0 640 560"
      className="h-auto w-full"
      fill="none"
      aria-hidden="true"
    >
      {/* Stage 1: fragments */}
      <motion.g style={{ opacity: ideaO }} stroke="var(--color-cream)" strokeOpacity="0.45">
        {IDEA_FRAGS.map((f, i) =>
          f.dot ? (
            <circle key={i} cx={f.x} cy={f.y} r="2" fill="var(--color-cream)" fillOpacity="0.4" stroke="none" />
          ) : (
            <line
              key={i}
              x1={f.x - f.len / 2}
              y1={f.y}
              x2={f.x + f.len / 2}
              y2={f.y}
              transform={`rotate(${f.rot} ${f.x} ${f.y})`}
              strokeWidth="1.2"
            />
          )
        )}
        <line x1="360" y1="330" x2="392" y2="356" stroke="var(--color-brass-bright)" strokeWidth="1.6" />
      </motion.g>

      {/* Stage 2: the product frame */}
      <motion.g style={{ opacity: frameO, scale: frameScale, transformOrigin: "320px 280px" }}>
        <rect x="150" y="110" width="340" height="340" rx="20" stroke="var(--color-cream)" strokeOpacity="0.8" strokeWidth="1.4" />
        <circle cx="184" cy="142" r="3" stroke="var(--color-cream)" strokeOpacity="0.5" strokeWidth="1.2" />
        <circle cx="200" cy="142" r="3" stroke="var(--color-cream)" strokeOpacity="0.5" strokeWidth="1.2" />
        <line x1="180" y1="172" x2="460" y2="172" stroke="var(--color-cream)" strokeOpacity="0.35" strokeWidth="1.2" />
        {ROWS.map((r) => (
          <line key={r.y} x1="180" y1={r.y} x2={180 + r.w} y2={r.y} stroke="var(--color-cream)" strokeOpacity="0.5" strokeWidth="1.2" />
        ))}
        <rect x="180" y="366" width="118" height="36" rx="18" stroke="var(--color-brass-bright)" strokeWidth="1.4" />
        <line x1="204" y1="384" x2="274" y2="384" stroke="var(--color-brass-bright)" strokeWidth="1.4" />
      </motion.g>

      {/* Stage 3: conduits and nodes */}
      <motion.g style={{ opacity: autoO }}>
        {CONDUITS.map((d) => (
          <motion.path
            key={d}
            d={d}
            pathLength={1}
            strokeDasharray="1"
            style={{ strokeDashoffset: autoDashoffset }}
            stroke="var(--color-cream)"
            strokeOpacity="0.55"
            strokeWidth="1.2"
          />
        ))}
        {[150, 280, 410].map((y) => (
          <rect key={y} x="574" y={y - 14} width="28" height="28" rx="7" stroke="var(--color-cream)" strokeOpacity="0.7" strokeWidth="1.3" />
        ))}
        <circle cx="588" cy="280" r="3.5" fill="var(--color-brass-bright)" />
      </motion.g>

      {/* Stage 4: pipeline rows settle into the frame */}
      <motion.g style={{ opacity: pipeO, x: pipeX }}>
        {PIPE_ROWS.map((r, i) => (
          <g key={i}>
            <circle cx="196" cy={r.y} r="3" stroke={r.brass ? "var(--color-brass-bright)" : "var(--color-cream)"} strokeOpacity={r.brass ? 1 : 0.5} strokeWidth="1.3" fill="none" />
            <line x1="212" y1={r.y} x2={212 + r.w} y2={r.y} stroke="var(--color-cream)" strokeOpacity="0.5" strokeWidth="1.2" />
            {r.brass ? (
              <path d={`M${420} ${r.y - 4} l5 6 l9 -10`} stroke="var(--color-brass-bright)" strokeWidth="1.5" />
            ) : null}
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

/* Static snapshots for mobile / reduced motion. */
const SNAPSHOTS = [
  { ideaO: 1, frameO: 0, frameScale: 1, autoO: 0, autoDashoffset: 1, pipeO: 0, pipeX: 0 },
  { ideaO: 0, frameO: 1, frameScale: 1, autoO: 0, autoDashoffset: 1, pipeO: 0, pipeX: 0 },
  { ideaO: 0, frameO: 1, frameScale: 1, autoO: 1, autoDashoffset: 0, pipeO: 0, pipeX: 0 },
  { ideaO: 0, frameO: 1, frameScale: 1, autoO: 1, autoDashoffset: 0, pipeO: 1, pipeX: 0 },
];

function StoryHeader() {
  return (
    <div className="container-page">
      <p className="label text-accent">The transformation</p>
      <h2 className="display-m mt-5 max-w-2xl text-t1">
        Watch an idea become an operating business.
      </h2>
    </div>
  );
}

function StickyStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Fade-out transforms carry an explicit trailing keyframe holding the
  // value at its end state through p=1, so no caption or fragment can
  // re-emerge past its stage (framer's clamp was letting idea climb back).
  const ideaO = useTransform(p, [0, 0.2, 0.28, 1], [1, 1, 0, 0]);
  const frameO = useTransform(p, [0.22, 0.32], [0, 1]);
  const frameScale = useTransform(p, [0.22, 0.34], [0.955, 1]);
  const autoO = useTransform(p, [0.46, 0.54], [0, 1]);
  const autoDraw = useTransform(p, [0.48, 0.62], [0, 1]);
  const autoDash = useTransform(autoDraw, (v) => 1 - v);
  const pipeO = useTransform(p, [0.7, 0.78], [0, 1]);
  const pipeX = useTransform(p, [0.7, 0.82], [-56, 0]);
  const railFill = useTransform(p, [0.05, 0.95], ["0%", "100%"]);

  // Exactly one caption is shown at a time, chosen by scroll position.
  // Rendering a single panel makes overlap structurally impossible.
  const [active, setActive] = useState(0);
  const boundaries = [0.26, 0.51, 0.76]; // idea | product | automation | pipeline
  useMotionValueEvent(p, "change", (v) => {
    let next = 0;
    for (let i = 0; i < boundaries.length; i++) {
      if (v >= boundaries[i]) next = i + 1;
    }
    setActive(next);
  });
  const stage = STAGES[active];

  return (
    <div ref={ref} className="relative h-[380vh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div className="container-page grid w-full grid-cols-12 items-center gap-6">
          <div className="relative col-span-4 h-56">
            <AnimatePresence>
              <motion.div
                key={stage.index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute inset-0"
              >
                <p className="label text-accent">
                  {stage.index} · {stage.name}
                </p>
                <h3 className="display-s mt-4 text-t1">{stage.title}</h3>
                <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-t2">
                  {stage.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="col-span-7">
            <Scene
              ideaO={ideaO}
              frameO={frameO}
              frameScale={frameScale}
              autoO={autoO}
              autoDashoffset={autoDash}
              pipeO={pipeO}
              pipeX={pipeX}
            />
          </div>
          <div className="col-span-1 flex justify-end" aria-hidden="true">
            <div className="relative h-48 w-px bg-line">
              <motion.div
                className="absolute left-0 top-0 w-px bg-brass-bright"
                style={{ height: railFill }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticStory() {
  return (
    <div className="container-page mt-4 space-y-16">
      {STAGES.map((s, i) => (
        <div key={s.index}>
          <div className="max-w-md">
            <p className="label text-accent">
              {s.index} · {s.name}
            </p>
            <h3 className="display-s mt-3 text-t1">{s.title}</h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-t2">{s.body}</p>
          </div>
          <div className="mx-auto mt-6 max-w-md">
            <Scene {...SNAPSHOTS[i]} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScrollStory() {
  const reduced = useReducedMotion();
  return (
    <section data-ground="ink" data-bp="S3 · Scroll story — sticky, 380vh" className="section-pad bg-ink" id="transformation">
      <StoryHeader />
      {reduced ? (
        <StaticStory />
      ) : (
        <>
          <div className="hidden md:block">
            <StickyStory />
          </div>
          <div className="md:hidden">
            <StaticStory />
          </div>
        </>
      )}
    </section>
  );
}
