"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";
import { onReveal } from "@/lib/overture-gate";
import { PrimaryLink, SecondaryLink } from "./ui";
import { FormationCanvas } from "./formation-canvas";

// Each line ends on its object, set in italic brass: the thing made.
const LINES: Array<[string, string]> = [
  ["Build the", "product."],
  ["Automate the", "workflow."],
  ["Fill the", "pipeline."],
];

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reduced = useReducedMotion() ?? false;

  // The entrance holds until the Overture lifts (immediately when it
  // already ran this session, or never runs). Belt and braces: a
  // timeout so a stalled gate can never leave the hero blank.
  const [go, setGo] = useState(false);
  useEffect(() => {
    const off = onReveal(() => setGo(true));
    const safety = setTimeout(() => setGo(true), 4500);
    return () => {
      off();
      clearTimeout(safety);
    };
  }, []);
  const play = reduced || go;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  // The copy recedes as the object completes, giving it the stage. On
  // small screens the object shares the column with the copy, so the
  // full fade also keeps the final beat legible there.
  const copyOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.08]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section
      ref={sectionRef}
      data-ground="ink"
      data-bp="S1 · Formation hero — hand-rolled 3D canvas engine"
      className="relative h-[240vh] bg-ink"
      aria-label="Sarga Haus. Build the product. Automate the workflow. Fill the pipeline."
    >
      <div className="lamplight sticky top-0 h-svh overflow-hidden">
        <FormationCanvas
          progressRef={progressRef}
          reduced={reduced}
          className="absolute inset-0 h-full w-full"
        />
        {/* A quiet vignette keeps the type legible over the field. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(13,12,10,0.82) 0%, rgba(13,12,10,0.35) 45%, rgba(13,12,10,0) 70%)",
          }}
        />

        <div className="container-page relative flex h-full flex-col justify-center">
          <motion.div style={reduced ? undefined : { opacity: copyOpacity }} className="max-w-3xl">
            <motion.p
              className="label text-cream-faint"
              initial={reduced ? false : { opacity: 0 }}
              animate={play ? { opacity: 1 } : undefined}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            >
              A founder-led product studio
            </motion.p>
            <h1
              className="font-display mt-6 text-cream"
              style={{
                fontSize: "clamp(2.5rem, 4.6vw, 4.25rem)",
                lineHeight: 1.06,
                fontWeight: 420,
                letterSpacing: "-0.028em",
                textWrap: "balance",
              }}
            >
              {LINES.map(([pre, obj], i) => (
                <span key={obj} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={reduced ? false : { y: "105%" }}
                    animate={play ? { y: 0 } : undefined}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.35 + i * 0.14 }}
                  >
                    {pre}{" "}
                    <em className="serif-italic text-brass-bright">{obj}</em>
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              className="standfirst mt-7 max-w-lg text-cream-dim"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={play ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.8, ease: EASE, delay: 0.95 }}
            >
              Sarga Haus turns real ideas and broken operations into products,
              systems, and customer pipelines built to move.
            </motion.p>
            <motion.div
              className="mt-9 flex flex-wrap items-center gap-4"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={play ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
            >
              <PrimaryLink href="/start">Start a project</PrimaryLink>
              <SecondaryLink href="#system">See the system</SecondaryLink>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
            style={reduced ? undefined : { opacity: cueOpacity }}
            initial={reduced ? false : { opacity: 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 1.6 }}
            aria-hidden="true"
          >
            <span className="label text-cream-faint">Scroll to give it form</span>
            <span className="block h-10 w-px overflow-hidden bg-line">
              <motion.span
                className="block h-4 w-px bg-brass-bright"
                initial={{ y: -16 }}
                animate={reduced ? { y: 12 } : { y: [ -16, 40 ] }}
                transition={reduced ? undefined : { duration: 1.8, ease: "easeInOut", repeat: 2, delay: 2 }}
              />
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
