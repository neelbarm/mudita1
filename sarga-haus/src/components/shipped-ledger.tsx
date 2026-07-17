"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { SHIPPED, type ShippedBuild } from "@/lib/builds";
import { Reveal } from "./ui";

/**
 * The shipped ledger, shared by the home preview and the builds page.
 * On fine pointers, hovering a row summons a specimen plate that trails
 * the cursor: name, role, address, and a live pulse. Typographic on
 * purpose; screenshots of client work publish only with approval.
 */

function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

const SPRING = { stiffness: 380, damping: 34, mass: 0.7 };

function SpecimenPlate({ plate }: { plate: ShippedBuild | null }) {
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(Math.min(e.clientX + 22, window.innerWidth - 268));
      my.set(Math.min(e.clientY + 24, window.innerHeight - 130));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[80]"
      aria-hidden="true"
    >
      <AnimatePresence>
        {plate && (
          <motion.div
            key={plate.slug}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="w-60 overflow-hidden rounded-xl border border-cream/15 bg-coal/95 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.8)] backdrop-blur-sm"
          >
            <div className="border-b border-cream/10 px-4 pb-3 pt-3.5">
              <p className="font-display text-[1.1rem] leading-tight text-cream" style={{ fontWeight: 450 }}>
                {plate.name}
              </p>
              <p className="mt-1.5 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-cream-faint">
                {plate.category}
                {plate.scope ? (
                  <span className="text-brass-bright">{"  ·  "}{plate.scope}</span>
                ) : null}
              </p>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="inline-flex items-center gap-2 text-[0.75rem] text-cream-dim">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass-bright opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brass-bright" />
                </span>
                Live now
              </span>
              <span className="text-[0.75rem] text-cream-faint">{hostOf(plate.href)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ShippedLedger({ variant }: { variant: "preview" | "page" }) {
  const reduced = useReducedMotionSafe();
  const [fine, setFine] = useState(false);
  const [plate, setPlate] = useState<ShippedBuild | null>(null);

  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  const plateOn = fine && !reduced;
  const enter = (s: ShippedBuild) => () => plateOn && setPlate(s);
  const leave = () => setPlate(null);

  return (
    <div onPointerLeave={leave}>
      {SHIPPED.map((s, i) => (
        <Reveal key={s.slug} delay={i * 0.06}>
          <a
            href={s.href}
            target="_blank"
            rel="noreferrer"
            onPointerEnter={enter(s)}
            onFocus={() => setPlate(null)}
            className={`group grid grid-cols-1 border-t border-line transition-colors duration-300 last:border-b hover:bg-raised md:grid-cols-12 md:items-baseline md:gap-6 md:px-4 ${
              variant === "page" ? "gap-2 py-7" : "gap-1.5 py-6"
            }`}
          >
            <span className="label text-t3 md:col-span-2">
              {variant === "page" ? `0${i + 1}` : s.category}
            </span>
            <span className="md:col-span-4">
              <span
                className={`block font-display leading-tight text-t1 ${
                  variant === "page" ? "text-[1.5rem] md:text-[1.75rem]" : "text-[1.4rem] md:text-[1.6rem]"
                }`}
                style={{ fontWeight: 440 }}
              >
                {s.name}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
                {variant === "page" ? (
                  <span className="text-t3">{s.category}</span>
                ) : null}
                {variant === "page" && s.scope ? (
                  <span aria-hidden="true" className="text-t3/50">·</span>
                ) : null}
                {s.scope ? <span className="text-accent">{s.scope}</span> : null}
              </span>
            </span>
            <span className="text-[0.9375rem] leading-relaxed text-t2 md:col-span-4">
              {s.line}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[0.875rem] text-t3 transition-colors duration-300 group-hover:text-accent md:col-span-2 md:justify-end">
              {s.linkLabel}
              <ArrowUpRight
                size={14}
                strokeWidth={1.75}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </a>
        </Reveal>
      ))}
      {plateOn ? <SpecimenPlate plate={plate} /> : null}
    </div>
  );
}
