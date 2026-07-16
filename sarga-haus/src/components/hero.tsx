"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";
import { PrimaryLink, SecondaryLink } from "./ui";
import { FormationCanvas } from "./formation-canvas";

const LINES = ["Build the product.", "Automate the workflow.", "Fill the pipeline."];

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  // The copy quiets slightly as the object completes, giving it the stage.
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0.25]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section
      ref={sectionRef}
      data-ground="ink"
      data-bp="S1 · Formation hero — hand-rolled 3D canvas engine"
      className="relative h-[240vh] bg-ink"
      aria-label="Sarga Haus. Build the product. Automate the workflow. Fill the pipeline."
    >
      <div className="sticky top-0 h-svh overflow-hidden">
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
              className="label text-brass-bright"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
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
              {LINES.map((line, i) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={reduced ? false : { y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.35 + i * 0.14 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              className="standfirst mt-7 max-w-lg text-cream-dim"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.95 }}
            >
              Sarga Haus turns real ideas and broken operations into products,
              systems, and customer pipelines built to move.
            </motion.p>
            <motion.div
              className="mt-9 flex flex-wrap items-center gap-4"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
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
            animate={{ opacity: 1 }}
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
