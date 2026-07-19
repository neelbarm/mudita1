"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { EASE } from "@/lib/motion";
import { revealPage } from "@/lib/overture-gate";

const KEY = "sarga-overture-seen";
const PULL_THRESHOLD = 78;
const MAX_PULL = 130;

function seen(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return true; // storage unavailable: never risk replaying forever
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* private mode: fine, it just may replay */
  }
}

/**
 * The Overture, second movement: a question and a light switch.
 * First visit each session: "Do you have an idea?" Yes or no, then a
 * light bulb on a cord. The visitor pulls the cord, the light comes
 * on, and the light is the site. Escape or Skip works throughout;
 * reduced motion skips the whole theater.
 */
export function Overture() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"ask" | "cord" | "lit">("ask");
  const [answer, setAnswer] = useState<"yes" | "no">("yes");
  const started = useRef(false);
  const litRef = useRef(false);
  const dragging = useRef<number | null>(null);
  const startY = useRef(0);

  const pull = useMotionValue(0);
  const cordLen = useSpring(pull, { stiffness: 420, damping: 27 });
  const cordHeight = useTransform(cordLen, (v) => 84 + v);

  const finish = () => {
    revealPage();
    setShow(false);
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (seen() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealPage();
      return;
    }
    markSeen();
    setShow(true);
    document.documentElement.style.overflow = "hidden";

    const done = () => {
      revealPage();
      setShow(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") done();
    };
    // If nothing happens for a minute, the site opens itself.
    const safety = setTimeout(done, 60_000);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(safety);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const switchOn = () => {
    if (litRef.current) return;
    litRef.current = true;
    dragging.current = null;
    pull.set(0);
    setPhase("lit");
    setTimeout(finish, 1050);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (litRef.current) return;
    dragging.current = e.pointerId;
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragging.current !== e.pointerId) return;
    const dy = Math.min(MAX_PULL, Math.max(0, e.clientY - startY.current));
    pull.set(dy);
    if (dy >= PULL_THRESHOLD) switchOn();
  };
  const releaseCord = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragging.current !== e.pointerId) return;
    dragging.current = null;
    if (!litRef.current) pull.set(0);
  };

  const lit = phase === "lit";

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = "";
      }}
    >
      {show && (
        <motion.div
          key="overture"
          className="fixed inset-0 z-[96] overflow-hidden bg-ink"
          initial={false}
          exit={{ y: "-100%", transition: { duration: 0.9, ease: EASE } }}
          aria-label="Welcome. Pull the cord to turn the light on, or press Escape to skip."
        >
          {/* The room, before and after the light. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 45% at 50% 62%, rgb(196 168 122 / 0.05), transparent 70%)",
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: lit ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{
              background:
                "radial-gradient(60% 52% at 50% 34%, rgb(196 168 122 / 0.32), rgb(196 168 122 / 0.07) 45%, transparent 72%)",
            }}
          />

          <motion.div
            className="relative flex h-full flex-col items-center justify-center px-6"
            exit={{ y: "-22vh", opacity: 0.5, transition: { duration: 0.9, ease: EASE } }}
          >
            <AnimatePresence mode="wait">
              {phase === "ask" ? (
                <motion.div
                  key="ask"
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.25 } }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.35, ease: EASE } }}
                >
                  <p className="label text-cream-faint">Before anything else</p>
                  <h2
                    className="font-display mt-6 text-cream"
                    style={{ fontSize: "clamp(2rem, 6vw, 3.4rem)", fontWeight: 450, letterSpacing: "-0.02em", lineHeight: 1.05 }}
                  >
                    Do you have an idea?
                  </h2>
                  <div className="mt-10 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAnswer("yes");
                        setPhase("cord");
                      }}
                      className="min-h-11 rounded-full border border-cream/30 px-8 py-2.5 text-[0.9375rem] text-cream transition-colors duration-300 hover:border-brass-bright hover:text-brass-bright"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnswer("no");
                        setPhase("cord");
                      }}
                      className="min-h-11 rounded-full border border-cream/30 px-8 py-2.5 text-[0.9375rem] text-cream transition-colors duration-300 hover:border-brass-bright hover:text-brass-bright"
                    >
                      No
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="cord"
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.6, ease: EASE } }}
                >
                  <motion.p
                    className="serif-italic px-4 text-[1.05rem] text-cream-dim md:text-[1.2rem]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: lit ? 0 : 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.1 } }}
                  >
                    {answer === "yes"
                      ? "Then let's give it form."
                      : "Even better. Broken workflows are half our favorite work."}
                  </motion.p>

                  {/* The pendant: line, bulb, cord, handle. All drawn. */}
                  <div className="mt-6 flex flex-col items-center">
                    <div className="w-px bg-cream/20" style={{ height: "16vh", minHeight: 70 }} />
                    <motion.svg
                      width="92"
                      height="118"
                      viewBox="0 0 92 118"
                      fill="none"
                      role="button"
                      tabIndex={0}
                      aria-label="The light bulb. Activate to turn it on."
                      onClick={switchOn}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") switchOn();
                      }}
                      className="cursor-pointer focus-visible:outline-2"
                      initial={false}
                      animate={lit ? { filter: "drop-shadow(0 0 34px rgba(196,168,122,0.85))" } : { filter: "drop-shadow(0 0 0px rgba(196,168,122,0))" }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      {/* socket */}
                      <rect x="38" y="0" width="16" height="14" rx="3" stroke={lit ? "var(--color-brass-bright)" : "rgba(237,233,224,0.45)"} strokeWidth="1.4" />
                      <path d="M38 18 H54 M38 23 H54" stroke={lit ? "var(--color-brass-bright)" : "rgba(237,233,224,0.35)"} strokeWidth="1.3" />
                      {/* glass */}
                      <motion.path
                        d="M46 28 C 27 28 18 43 18 57 C 18 70 26 77 32 84 C 36 88 37 93 37 97 H 55 C 55 93 56 88 60 84 C 66 77 74 70 74 57 C 74 43 65 28 46 28 Z"
                        strokeWidth="1.4"
                        initial={false}
                        animate={{
                          stroke: lit ? "var(--color-brass-bright)" : "rgba(237,233,224,0.5)",
                          fill: lit ? "rgba(196,168,122,0.22)" : "rgba(237,233,224,0.02)",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                      {/* filament */}
                      <motion.path
                        d="M40 96 V78 L46 66 L52 78 V96 M40 78 H52"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        initial={false}
                        animate={
                          lit
                            ? { stroke: "#f0d9ac", opacity: [0.4, 1, 0.55, 1], transition: { duration: 0.5, times: [0, 0.3, 0.5, 1] } }
                            : { stroke: "rgba(237,233,224,0.4)", opacity: 1 }
                        }
                      />
                      {/* base cap */}
                      <path d="M37 97 H55 V104 Q55 108 51 108 H41 Q37 108 37 104 Z" stroke={lit ? "var(--color-brass-bright)" : "rgba(237,233,224,0.45)"} strokeWidth="1.4" />
                    </motion.svg>

                    {/* the pull cord */}
                    <motion.div className="w-px bg-cream/35" style={{ height: cordHeight }} />
                    <motion.button
                      type="button"
                      aria-label="Pull the cord to turn the light on"
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={releaseCord}
                      onPointerCancel={releaseCord}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") switchOn();
                      }}
                      className="flex h-11 w-11 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                    >
                      <span
                        className="block h-4 w-4 rounded-full border-2 border-brass-bright"
                        style={{ boxShadow: "0 0 12px rgba(196,168,122,0.35)" }}
                      />
                    </motion.button>
                    <motion.p
                      className="label mt-2 text-cream-faint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: lit ? 0 : 1, transition: { delay: 0.5, duration: 0.6 } }}
                    >
                      pull the cord
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {!lit && (
            <button
              type="button"
              onClick={finish}
              className="absolute bottom-6 right-6 min-h-11 px-3 text-[0.8125rem] text-cream-faint transition-colors duration-300 hover:text-cream"
            >
              Skip
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
