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
import { onReveal, requestOverture } from "@/lib/overture-gate";
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

  // The reveal fires immediately on load now (the Overture no longer
  // gates first paint); the subscription plus a short fallback simply
  // makes the entrance robust if that ever changes.
  const [go, setGo] = useState(false);
  useEffect(() => {
    const off = onReveal(() => setGo(true));
    const safety = setTimeout(() => setGo(true), 1500);
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
      className="relative h-[200vh] bg-ink"
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

        {/* The pendant lamp: the light turns on as part of the entrance,
            and pulling it plays the full opening as an optional show. */}
        {!reduced && (
          <motion.button
            type="button"
            aria-label="Play the opening"
            data-cursor-label="Pull"
            onClick={() => requestOverture()}
            className="group absolute left-[63%] top-0 z-10 hidden cursor-pointer flex-col items-center md:flex"
            style={{ transformOrigin: "top center" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: [0, 1.6, -1.1, 0.5, 0] }}
            whileHover={{ scale: 1.05 }}
            transition={{
              opacity: { duration: 0.9, ease: EASE, delay: 1.5 },
              rotate: { duration: 9, ease: "easeInOut", delay: 2.6, repeat: Infinity, repeatDelay: 4 },
              scale: { duration: 0.3, ease: EASE },
            }}
          >
            <span
              className="block h-[11vh] min-h-[4.75rem] w-px"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0, rgba(237,233,224,0.06) 3.5rem, rgba(237,233,224,0.22) 100%)",
              }}
            />
            <motion.svg
              width="34"
              height="44"
              viewBox="0 0 92 118"
              fill="none"
              aria-hidden="true"
              initial={{ filter: "drop-shadow(0 0 0px rgba(196,168,122,0))" }}
              animate={{ filter: "drop-shadow(0 0 14px rgba(196,168,122,0.6))" }}
              transition={{ duration: 0.5, ease: EASE, delay: 1.95 }}
            >
              <rect x="38" y="0" width="16" height="14" rx="3" stroke="var(--color-brass-bright)" strokeWidth="3.2" />
              <path d="M38 18 H54 M38 23 H54" stroke="var(--color-brass-bright)" strokeWidth="3" opacity="0.8" />
              <motion.path
                d="M46 28 C 27 28 18 43 18 57 C 18 70 26 77 32 84 C 36 88 37 93 37 97 H 55 C 55 93 56 88 60 84 C 66 77 74 70 74 57 C 74 43 65 28 46 28 Z"
                stroke="var(--color-brass-bright)"
                strokeWidth="3.4"
                initial={{ fill: "rgba(196,168,122,0)" }}
                animate={{ fill: "rgba(196,168,122,0.2)" }}
                transition={{ duration: 0.4, delay: 1.95 }}
              />
              <motion.path
                d="M40 96 V78 L46 66 L52 78 V96 M40 78 H52"
                stroke="#f0d9ac"
                strokeWidth="3.2"
                strokeLinecap="round"
                initial={{ opacity: 0.25 }}
                animate={{ opacity: [0.25, 1, 0.5, 1] }}
                transition={{ duration: 0.6, times: [0, 0.4, 0.6, 1], delay: 1.95 }}
              />
              <path d="M37 97 H55 V104 Q55 108 51 108 H41 Q37 108 37 104 Z" stroke="var(--color-brass-bright)" strokeWidth="3.2" />
            </motion.svg>
            <span className="label mt-3 whitespace-nowrap text-cream-faint opacity-55 transition-opacity duration-300 group-hover:opacity-100">
              the opening
            </span>
          </motion.button>
        )}

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
              For founders and operators without a technical team: a working
              product in weeks, the operation automated, the pipeline filled.
              Flat fee, priced before work starts.
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
