"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
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

const LAMP_KEY = "sarga-lamp-lit";
const PULL_THRESHOLD = 64;
const MAX_PULL = 120;

// Spark offsets for the switch-on burst; fixed so server and client agree.
const MOTES: Array<[number, number]> = [
  [-38, -10], [36, -16], [-24, 20], [28, 26],
  [-44, 24], [46, 4], [-12, -30], [14, 34],
];

/**
 * The hero is a dark room with the pitch already on the wall. A
 * pendant bulb hangs over the field; pulling its cord turns the room
 * on: filament flicker, a wash of light, the copy at full strength.
 * Nothing is gated: the copy is legible from the first frame, and
 * scrolling or eight idle seconds turns the light on anyway. Once
 * lit, the same cord plays the full opening. Reduced motion starts
 * lit with no pendant.
 */
export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reduced = useReducedMotion() ?? false;

  // The reveal fires immediately on load; the subscription plus a
  // short fallback simply makes the entrance robust if that changes.
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

  // ---- the lamp ----
  const [lit, setLit] = useState(false);
  const [ignited, setIgnited] = useState(false); // true only when switched on this load
  const litRef = useRef(false);
  const ignitedAt = useRef(0);
  const justDragged = useRef(false);
  const dragging = useRef<number | null>(null);
  const startY = useRef(0);

  const pull = useMotionValue(0);
  const cordLen = useSpring(pull, { stiffness: 420, damping: 27 });
  const cordHeight = useTransform(cordLen, (v) => 74 + v);

  const ignite = () => {
    if (litRef.current) return;
    litRef.current = true;
    ignitedAt.current = performance.now();
    setLit(true);
    setIgnited(true);
    try {
      sessionStorage.setItem(LAMP_KEY, "1");
    } catch {
      /* fine */
    }
  };

  // Restore a lit room within the session; reduced motion starts lit.
  useEffect(() => {
    let stored = false;
    try {
      stored = sessionStorage.getItem(LAMP_KEY) === "1";
    } catch {
      stored = true; // no storage: never make anyone re-light the room
    }
    if (reduced || stored) {
      litRef.current = true;
      setLit(true);
      return;
    }
    // The room never stays dark on anyone: scrolling flips the switch,
    // and so does standing still for eight seconds.
    const t = setTimeout(ignite, 8000);
    const onScroll = () => {
      if (window.scrollY > 120) ignite();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // A moment of grace after ignition: an excited double-tap should
  // not yank the visitor straight into the full show.
  const lampAction = () => {
    if (justDragged.current) {
      justDragged.current = false;
      return;
    }
    if (!litRef.current) ignite();
    else if (performance.now() - ignitedAt.current > 900) requestOverture();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    dragging.current = e.pointerId;
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (dragging.current !== e.pointerId) return;
    const dy = Math.min(MAX_PULL, Math.max(0, e.clientY - startY.current));
    pull.set(dy);
    if (dy >= PULL_THRESHOLD) {
      dragging.current = null;
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 350);
      pull.set(0);
      if (!litRef.current) ignite();
      else if (performance.now() - ignitedAt.current > 900) requestOverture();
    }
  };
  const releaseCord = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (dragging.current !== e.pointerId) return;
    dragging.current = null;
    pull.set(0);
  };

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
      data-bp="S1 · Formation hero — dark room, pull-cord light, hand-rolled 3D canvas engine"
      className="relative h-[200vh] bg-ink"
      aria-label="Sarga Haus. Build the product. Automate the workflow. Fill the pipeline."
    >
      <div className="lamplight sticky top-0 h-svh overflow-hidden">
        <FormationCanvas
          progressRef={progressRef}
          reduced={reduced}
          className="absolute inset-0 h-full w-full"
        />

        {/* The gloom: the room before the light. Legible, just dark. */}
        <motion.div
          data-lamp-scrim
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-ink"
          initial={false}
          animate={{ opacity: lit ? 0 : 0.52 }}
          transition={{ duration: 1.1, ease: EASE }}
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

        {/* The warm room while the lamp is on. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{ opacity: lit ? 0.2 : 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          style={{
            background:
              "radial-gradient(58% 48% at 63% 20%, rgb(196 168 122 / 0.5), rgb(196 168 122 / 0.1) 45%, transparent 75%)",
          }}
        />
        {/* The switch-on wash: one bloom sweeping the room. */}
        {ignited && !reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: [0, 0.85, 0], scale: [0.55, 1.35, 1.6] }}
            transition={{ duration: 1.5, ease: EASE, times: [0, 0.3, 1] }}
            style={{
              transformOrigin: "63% 18%",
              background:
                "radial-gradient(52% 44% at 63% 18%, rgb(196 168 122 / 0.55), rgb(196 168 122 / 0.12) 50%, transparent 74%)",
            }}
          />
        )}

        {/* The pendant lamp: the switch for the room, then the show. */}
        {!reduced && (
          <motion.button
            type="button"
            data-pendant
            aria-label={lit ? "Play the opening" : "Pull the cord to turn the light on"}
            data-cursor-label="Pull"
            onClick={lampAction}
            className="group absolute right-10 top-0 z-10 flex cursor-pointer flex-col items-center md:left-[63%] md:right-auto"
            style={{ transformOrigin: "top center" }}
            initial={{ opacity: 0 }}
            animate={
              ignited
                ? { opacity: 1, rotate: [0, -5, 3, -1.5, 0.6, 0] }
                : { opacity: 1, rotate: [0, 1.6, -1.1, 0.5, 0] }
            }
            whileHover={{ scale: 1.04 }}
            transition={{
              opacity: { duration: 0.9, ease: EASE, delay: 0.6 },
              rotate: ignited
                ? { duration: 1.7, ease: EASE }
                : { duration: 9, ease: "easeInOut", delay: 2.4, repeat: Infinity, repeatDelay: 4 },
              scale: { duration: 0.3, ease: EASE },
            }}
          >
            <span className="flex origin-top scale-[0.78] flex-col items-center md:scale-100">
              <span
                className="block h-[11vh] min-h-[4.75rem] w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0, rgba(237,233,224,0.06) 55%, rgba(237,233,224,0.22) 100%)",
                }}
              />
              <span className="relative">
                <motion.svg
                  width="42"
                  height="54"
                  viewBox="0 0 92 118"
                  fill="none"
                  aria-hidden="true"
                  initial={false}
                  animate={
                    lit
                      ? { filter: "drop-shadow(0 0 18px rgba(196,168,122,0.7))" }
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
                {/* sparks on switch-on */}
                {ignited && (
                  <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
                    {MOTES.map(([dx, dy], i) => (
                      <motion.span
                        key={i}
                        className="absolute block h-[3px] w-[3px] rounded-full"
                        style={{ background: "var(--color-brass-bright)" }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{ x: dx, y: dy, opacity: 0, scale: 0.4 }}
                        transition={{ duration: 0.75 + i * 0.05, ease: EASE }}
                      />
                    ))}
                  </span>
                )}
              </span>

              {/* the cord and its ring */}
              <motion.span className="block w-px bg-cream/35" style={{ height: cordHeight }} />
              <span
                data-cord-ring
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={releaseCord}
                onPointerCancel={releaseCord}
                className="flex h-11 w-11 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
              >
                <span
                  className="block h-4 w-4 rounded-full border-2 border-brass-bright"
                  style={{ boxShadow: "0 0 12px rgba(196,168,122,0.35)" }}
                />
              </span>
              {lit ? (
                <span className="label mt-1 hidden whitespace-nowrap text-cream-faint opacity-55 transition-opacity duration-300 group-hover:opacity-100 md:block">
                  the opening
                </span>
              ) : (
                <motion.span
                  className="label mt-1 hidden whitespace-nowrap text-cream-faint md:block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.45, 0.9, 0.45] }}
                  transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, delay: 1.6 }}
                >
                  pull the cord
                </motion.span>
              )}
            </span>
          </motion.button>
        )}

        <motion.div
          data-lamp-dim
          className="container-page relative flex h-full flex-col justify-center"
          initial={false}
          animate={{ opacity: lit ? 1 : 0.58 }}
          transition={{ duration: 1, ease: EASE }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
