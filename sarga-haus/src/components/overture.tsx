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
import { onOvertureRequest, revealPage } from "@/lib/overture-gate";

const PULL_THRESHOLD = 78;
const MAX_PULL = 130;

// The prologue after the light comes on: what the studio does, in
// four beats, then back to the site. Auto-advances; tap, Enter,
// Space, or ArrowRight moves faster. Same honesty rules as
// everywhere else.
const STEPS: Array<{ label: string; head: string; sub: string }> = [
  {
    label: "First",
    head: "The build.",
    sub: "Design, code, ship. A working product in weeks, not quarters.",
  },
  {
    label: "Then",
    head: "The machine.",
    sub: "Intake, follow-up, invoices. The operation runs while you sleep.",
  },
  {
    label: "Then",
    head: "The pipeline.",
    sub: "The right people, found and reached. A person approves every send.",
  },
  {
    label: "Finally",
    head: "Lights on.",
    sub: "One partner. One flat fee. The rest is the site.",
  },
];
const STEP_MS = 3000;
const LAST_STEP_MS = 3400;

/**
 * The Overture: a question, a light switch, and a journey. It no
 * longer blocks the front door; the site loads instantly and the show
 * plays only when asked for, from the pendant lamp in the hero.
 * "Do you have an idea?" Yes or no, then a light bulb on a cord. Pull
 * the cord, the light comes on, the bulb rises to a small lit pendant,
 * and beneath it the studio tells you what it does in four beats
 * before the veil lifts back off. Escape or Skip works throughout.
 */
export function Overture() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"ask" | "cord" | "lit" | "journey">("ask");
  const [answer, setAnswer] = useState<"yes" | "no">("yes");
  const [step, setStep] = useState(0);
  const litRef = useRef(false);
  const doneRef = useRef(false);
  const stepRef = useRef(0);
  const showRef = useRef(false);
  const advanceRef = useRef<() => void>(() => {});
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef<number | null>(null);
  const startY = useRef(0);

  const pull = useMotionValue(0);
  const cordLen = useSpring(pull, { stiffness: 420, damping: 27 });
  const cordHeight = useTransform(cordLen, (v) => 84 + v);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    showRef.current = false;
    if (safetyRef.current) clearTimeout(safetyRef.current);
    setShow(false);
  };

  const next = () => {
    if (doneRef.current) return;
    if (stepRef.current >= STEPS.length - 1) {
      finish();
      return;
    }
    stepRef.current += 1;
    setStep(stepRef.current);
  };
  advanceRef.current = () => {
    if (phase === "journey") next();
  };

  useEffect(() => {
    // The page never waits on the show anymore.
    revealPage();

    const open = () => {
      if (showRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      litRef.current = false;
      doneRef.current = false;
      stepRef.current = 0;
      dragging.current = null;
      pull.jump(0);
      setStep(0);
      setAnswer("yes");
      setPhase("ask");
      showRef.current = true;
      setShow(true);
      document.documentElement.style.overflow = "hidden";
      // If nothing happens for a minute, the show bows out on its own.
      if (safetyRef.current) clearTimeout(safetyRef.current);
      safetyRef.current = setTimeout(() => {
        doneRef.current = true;
        showRef.current = false;
        setShow(false);
      }, 60_000);
    };

    const offRequest = onOvertureRequest(open);
    const onKey = (e: KeyboardEvent) => {
      if (!showRef.current) return;
      if (e.key === "Escape") {
        doneRef.current = true;
        showRef.current = false;
        if (safetyRef.current) clearTimeout(safetyRef.current);
        setShow(false);
      }
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        advanceRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      offRequest();
      window.removeEventListener("keydown", onKey);
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The journey paces itself; any tap or key hurries it along.
  useEffect(() => {
    if (phase !== "journey" || !show) return;
    const t = setTimeout(
      () => next(),
      step >= STEPS.length - 1 ? LAST_STEP_MS : STEP_MS,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step, show]);

  const switchOn = () => {
    if (litRef.current) return;
    litRef.current = true;
    dragging.current = null;
    pull.set(0);
    // The bulb and cord are done as controls; a lingering focus ring
    // would sit on the lamp through the whole journey.
    const focused = document.activeElement;
    if (focused instanceof HTMLElement || focused instanceof SVGElement) focused.blur();
    setPhase("lit");
    setTimeout(() => {
      if (!doneRef.current) setPhase("journey");
    }, 1150);
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

  const on = phase === "lit" || phase === "journey";
  const journey = phase === "journey";
  const current = STEPS[step] ?? STEPS[STEPS.length - 1]!;

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.45, ease: EASE } }}
          exit={{ y: "-100%", opacity: 1, transition: { duration: 0.9, ease: EASE } }}
          onClick={() => {
            if (phase === "journey") next();
          }}
          aria-label="The opening. Pull the cord to turn the light on, or press Escape to leave."
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
            animate={{ opacity: on ? 1 : 0 }}
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
                    animate={{
                      opacity: on ? 0 : 1,
                      y: 0,
                      height: journey ? 0 : "auto",
                      transition: { duration: 0.6, ease: EASE, delay: on ? 0 : 0.1 },
                    }}
                  >
                    {answer === "yes"
                      ? "Then let's give it form."
                      : "Even better. Broken workflows are half our favorite work."}
                  </motion.p>

                  {/* The pendant: line, bulb, cord, handle. All drawn.
                      Once lit, it rises into a small lamp above the journey. */}
                  <motion.div
                    className="mt-6 flex flex-col items-center"
                    style={{ transformOrigin: "top center" }}
                    animate={{ scale: journey ? 0.52 : 1 }}
                    transition={{ duration: 0.8, ease: EASE }}
                  >
                    <motion.div
                      className="w-px bg-cream/20"
                      style={{ minHeight: 40 }}
                      initial={false}
                      animate={{ height: journey ? "9vh" : "16vh" }}
                      transition={{ duration: 0.8, ease: EASE }}
                    />
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
                      animate={on ? { filter: "drop-shadow(0 0 34px rgba(196,168,122,0.85))" } : { filter: "drop-shadow(0 0 0px rgba(196,168,122,0))" }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      {/* socket */}
                      <rect x="38" y="0" width="16" height="14" rx="3" stroke={on ? "var(--color-brass-bright)" : "rgba(237,233,224,0.45)"} strokeWidth="1.4" />
                      <path d="M38 18 H54 M38 23 H54" stroke={on ? "var(--color-brass-bright)" : "rgba(237,233,224,0.35)"} strokeWidth="1.3" />
                      {/* glass */}
                      <motion.path
                        d="M46 28 C 27 28 18 43 18 57 C 18 70 26 77 32 84 C 36 88 37 93 37 97 H 55 C 55 93 56 88 60 84 C 66 77 74 70 74 57 C 74 43 65 28 46 28 Z"
                        strokeWidth="1.4"
                        initial={false}
                        animate={{
                          stroke: on ? "var(--color-brass-bright)" : "rgba(237,233,224,0.5)",
                          fill: on ? "rgba(196,168,122,0.22)" : "rgba(237,233,224,0.02)",
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
                          on
                            ? { stroke: "#f0d9ac", opacity: [0.4, 1, 0.55, 1], transition: { duration: 0.5, times: [0, 0.3, 0.5, 1] } }
                            : { stroke: "rgba(237,233,224,0.4)", opacity: 1 }
                        }
                      />
                      {/* base cap */}
                      <path d="M37 97 H55 V104 Q55 108 51 108 H41 Q37 108 37 104 Z" stroke={on ? "var(--color-brass-bright)" : "rgba(237,233,224,0.45)"} strokeWidth="1.4" />
                    </motion.svg>

                    {/* the pull cord: its work is done once the light is on */}
                    <motion.div
                      className="flex flex-col items-center overflow-hidden"
                      initial={false}
                      animate={{ opacity: journey ? 0 : 1, height: journey ? 0 : "auto" }}
                      transition={{ duration: 0.5, ease: EASE }}
                      style={{ pointerEvents: journey ? "none" : "auto" }}
                    >
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
                        animate={{ opacity: on ? 0 : 1, transition: { delay: 0.5, duration: 0.6 } }}
                      >
                        pull the cord
                      </motion.p>
                    </motion.div>
                  </motion.div>

                  {/* the journey: four beats under the lamp, then the site */}
                  {journey && (
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay: 0.25 } }}
                    >
                      <div className="flex min-h-[9.5rem] flex-col items-center justify-start md:min-h-[10.5rem]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={step}
                            className="flex flex-col items-center"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: EASE }}
                          >
                            <p className="label text-cream-faint">{current.label}</p>
                            <h3
                              className={
                                step === STEPS.length - 1
                                  ? "serif-italic mt-4 text-brass-bright"
                                  : "font-display mt-4 text-cream"
                              }
                              style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontWeight: 450, letterSpacing: "-0.02em", lineHeight: 1.05 }}
                            >
                              {current.head}
                            </h3>
                            <p className="mt-3 max-w-md px-4 text-[0.95rem] leading-relaxed text-cream-dim md:text-[1.05rem]">
                              {current.sub}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      <div className="mt-6 flex items-center gap-2" aria-hidden="true">
                        {STEPS.map((s, i) => (
                          <span
                            key={s.head}
                            className={`block h-px w-7 transition-colors duration-500 ${i <= step ? "bg-brass-bright" : "bg-cream/20"}`}
                          />
                        ))}
                      </div>
                      <motion.p
                        className="label mt-4 text-cream-faint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: step === 0 ? 0.8 : 0 }}
                        transition={{ duration: 0.5, delay: step === 0 ? 0.8 : 0 }}
                      >
                        tap anywhere
                      </motion.p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {phase !== "lit" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                finish();
              }}
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
