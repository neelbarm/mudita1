"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";
import { StoryCanvas } from "./story-canvas";

/**
 * The core narrative, made visible: one living object of ~230 fragments
 * that scroll physically morphs through four stages — orbiting idea
 * cloud, product interface, automation conduits with traveling pulses,
 * and a flowing pipeline. Desktop pins the scene and scrubs the story
 * engine; mobile and reduced motion get four frozen frames of the same
 * object, one per stage.
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

// Caption switches at the midpoint of each morph window (see story-canvas).
const CAPTION_BOUNDARIES = [0.23, 0.51, 0.79];

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
  const progressRef = useRef(0);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const railFill = useTransform(p, [0.05, 0.95], ["0%", "100%"]);

  const [active, setActive] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    progressRef.current = v;
    let next = 0;
    for (let i = 0; i < CAPTION_BOUNDARIES.length; i++) {
      if (v >= CAPTION_BOUNDARIES[i]) next = i + 1;
    }
    setActive(next);
  });
  const stage = STAGES[active];

  return (
    <div ref={ref} className="relative h-[420vh]">
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
            <div className="relative h-[68svh]">
              <StoryCanvas
                progressRef={progressRef}
                className="absolute inset-0 h-full w-full"
              />
            </div>
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
          <div className="relative mx-auto mt-6 h-64 w-full max-w-lg">
            <StoryCanvas staticStage={i} className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScrollStory() {
  const reduced = useReducedMotion();
  return (
    <section data-ground="ink" data-bp="S3 · Scroll story — canvas story engine, 420vh" className="section-pad bg-ink" id="transformation">
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
