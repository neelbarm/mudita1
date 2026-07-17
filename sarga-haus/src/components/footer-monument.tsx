"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";

const WORDS = ["Sarga", "Haus"];

/**
 * The monument: the studio's name set at architectural scale at the
 * foot of every page, each word rising out of its own mask. The brass
 * full stop is the signature: the work ends with a period, not an
 * ellipsis.
 */
export function FooterMonument() {
  const reduced = useReducedMotionSafe();
  return (
    <div aria-hidden="true" className="container-page select-none overflow-hidden pt-20 md:pt-24">
      {/* The in-view trigger lives on the paragraph: the word masks start
          fully clipped, so observing them directly would never fire. */}
      <motion.p
        className="font-display flex flex-wrap items-baseline text-cream"
        style={{
          fontSize: "clamp(3.9rem, 14.5vw, 13.5rem)",
          fontWeight: 435,
          letterSpacing: "-0.04em",
          lineHeight: 0.92,
          columnGap: "0.22em",
        }}
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={{ once: true, amount: 0.3 }}
      >
        {WORDS.map((w, i) => (
          <span key={w} className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="block"
              variants={{
                hidden: { y: "108%" },
                visible: {
                  y: 0,
                  transition: { duration: 1.1, ease: EASE, delay: 0.1 + i * 0.14 },
                },
              }}
            >
              {w}
              {i === WORDS.length - 1 ? (
                <span className="text-brass-bright">.</span>
              ) : null}
            </motion.span>
          </span>
        ))}
      </motion.p>
    </div>
  );
}
