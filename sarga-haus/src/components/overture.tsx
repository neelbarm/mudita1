"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { revealPage } from "@/lib/overture-gate";

const KEY = "sarga-overture-seen";
const HOLD_MS = 2450;

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

const draw = (delay: number, duration: number) => ({
  hidden: { strokeDashoffset: 1, opacity: 0 },
  visible: {
    strokeDashoffset: 0,
    opacity: 1,
    transition: { duration, ease: EASE, delay },
  },
});

/**
 * The Overture: a once-per-session opening. The mark draws itself out
 * of the dark, the name arrives, and the whole veil lifts like a
 * curtain to hand the stage to the page. Click, key, or scroll skips.
 */
export function Overture() {
  const [show, setShow] = useState(false);
  const started = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const finish = () => {
      if (timer.current) clearTimeout(timer.current);
      revealPage();
      setShow(false);
    };
    timer.current = setTimeout(finish, HOLD_MS);

    const skip = () => finish();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    };
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = "";
      }}
    >
      {show && (
        <motion.div
          key="overture"
          className="fixed inset-0 z-[96] flex items-center justify-center bg-ink"
          initial={false}
          exit={{ y: "-100%", transition: { duration: 0.9, ease: EASE } }}
          aria-hidden="true"
        >
          {/* A faint floor of light so the veil reads as a room, not a hex value. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 45% at 50% 58%, rgb(196 168 122 / 0.06), transparent 70%)",
            }}
          />
          <motion.div
            className="relative flex flex-col items-center"
            exit={{ y: "-24vh", opacity: 0.4, transition: { duration: 0.9, ease: EASE } }}
          >
            <motion.svg
              width={84}
              height={84}
              viewBox="0 0 24 24"
              fill="none"
              initial="hidden"
              animate="visible"
            >
              <motion.path
                d="M8 3.5 H17 Q20.5 3.5 20.5 7 V17 Q20.5 20.5 17 20.5 H10"
                stroke="var(--color-cream)"
                strokeWidth="1.1"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                variants={draw(0.15, 1.0)}
              />
              <motion.path
                d="M3.5 16.5 V7 Q3.5 3.5 7 3.5"
                stroke="var(--color-cream)"
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity={0.55}
                pathLength={1}
                strokeDasharray="1"
                variants={draw(0.55, 0.8)}
              />
              <motion.path
                d="M2.5 21.5 L6.5 17.5"
                stroke="var(--color-brass-bright)"
                strokeWidth="1.1"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                variants={draw(1.0, 0.5)}
              />
            </motion.svg>

            <span className="mt-7 block overflow-hidden">
              <motion.span
                className="font-display block text-[1.6rem] text-cream md:text-[1.9rem]"
                style={{ fontWeight: 460, letterSpacing: "-0.02em" }}
                initial={{ y: "110%" }}
                animate={{ y: 0, transition: { duration: 0.8, ease: EASE, delay: 1.1 } }}
              >
                Sarga Haus
              </motion.span>
            </span>

            <motion.span
              className="serif-italic mt-3 text-[0.9375rem] text-cream-faint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.7, ease: EASE, delay: 1.55 } }}
            >
              the act of bringing something into form
            </motion.span>

            <motion.span
              className="mt-8 block h-px bg-brass/60"
              initial={{ width: 0 }}
              animate={{ width: 120, transition: { duration: 0.9, ease: EASE, delay: 1.35 } }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
