"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * The unlit room. A page that never took form sits in the dark with
 * one pendant bulb; turning it on reveals the way back. Nobody is
 * trapped: six idle seconds light it anyway, and reduced motion
 * starts lit.
 */
export default function NotFound() {
  const [lit, setLit] = useState(false);
  const litRef = useRef(false);

  const ignite = () => {
    if (litRef.current) return;
    litRef.current = true;
    setLit(true);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      litRef.current = true;
      setLit(true);
      return;
    }
    const t = setTimeout(() => {
      litRef.current = true;
      setLit(true);
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div data-ground="ink" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      {/* the room warms when the light lands */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ opacity: lit ? 1 : 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        style={{
          background:
            "radial-gradient(55% 45% at 50% 30%, rgb(196 168 122 / 0.22), rgb(196 168 122 / 0.05) 45%, transparent 72%)",
        }}
      />

      {/* the pendant */}
      <button
        type="button"
        aria-label={lit ? "The light is on" : "Turn the light on"}
        onClick={ignite}
        className="group absolute left-1/2 top-0 flex -translate-x-1/2 cursor-pointer flex-col items-center"
      >
        <span
          className="block h-[13vh] min-h-[4.5rem] w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0, rgba(237,233,224,0.06) 40%, rgba(237,233,224,0.22) 100%)",
          }}
        />
        <motion.svg
          width="38"
          height="49"
          viewBox="0 0 92 118"
          fill="none"
          aria-hidden="true"
          initial={false}
          animate={
            lit
              ? { filter: "drop-shadow(0 0 16px rgba(196,168,122,0.7))" }
              : { filter: "drop-shadow(0 0 0px rgba(196,168,122,0))" }
          }
          transition={{ duration: 0.45, ease: EASE }}
        >
          <rect x="38" y="0" width="16" height="14" rx="3" stroke={lit ? "var(--color-brass-bright)" : "rgba(237,233,224,0.5)"} strokeWidth="3.2" />
          <path d="M38 18 H54 M38 23 H54" stroke={lit ? "var(--color-brass-bright)" : "rgba(237,233,224,0.4)"} strokeWidth="3" />
          <motion.path
            d="M46 28 C 27 28 18 43 18 57 C 18 70 26 77 32 84 C 36 88 37 93 37 97 H 55 C 55 93 56 88 60 84 C 66 77 74 70 74 57 C 74 43 65 28 46 28 Z"
            strokeWidth="3.4"
            initial={false}
            animate={{
              stroke: lit ? "var(--color-brass-bright)" : "rgba(237,233,224,0.55)",
              fill: lit ? "rgba(196,168,122,0.22)" : "rgba(237,233,224,0.02)",
            }}
            transition={{ duration: 0.35 }}
          />
          <motion.path
            d="M40 96 V78 L46 66 L52 78 V96 M40 78 H52"
            strokeWidth="3.2"
            strokeLinecap="round"
            initial={false}
            animate={
              lit
                ? { stroke: "#f0d9ac", opacity: [0.35, 1, 0.5, 1], transition: { duration: 0.55, times: [0, 0.35, 0.55, 1] } }
                : { stroke: "rgba(237,233,224,0.45)", opacity: 1 }
            }
          />
          <path d="M37 97 H55 V104 Q55 108 51 108 H41 Q37 108 37 104 Z" stroke={lit ? "var(--color-brass-bright)" : "rgba(237,233,224,0.5)"} strokeWidth="3.2" />
        </motion.svg>
        <motion.span
          className="label mt-3 text-cream-faint"
          initial={false}
          animate={{ opacity: lit ? 0 : [0.45, 0.9, 0.45] }}
          transition={lit ? { duration: 0.3 } : { duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        >
          turn the light on
        </motion.span>
      </button>

      <motion.div
        className="relative flex flex-col items-center"
        initial={false}
        animate={{ opacity: lit ? 1 : 0.45 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <p className="label text-cream-faint">Four oh four</p>
        <h1
          className="font-display mt-5 text-cream"
          style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 450, letterSpacing: "-0.02em", lineHeight: 1.05 }}
        >
          This page never took form.
        </h1>
        <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-cream-dim">
          The address is wrong or the page has moved. Half our favorite work
          starts exactly like this.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full bg-cream px-6 py-2.5 text-[0.9375rem] font-medium text-ink transition-colors duration-300 hover:bg-brass-bright"
          >
            Back to the studio
          </Link>
          <Link
            href="/journal"
            className="min-h-11 py-2.5 text-[0.9375rem] text-cream-dim underline decoration-cream/30 underline-offset-4 transition-colors duration-300 hover:text-cream"
          >
            Read the journal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
