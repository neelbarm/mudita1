"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE, VIEWPORT } from "@/lib/motion";
import { InlineLink, PrimaryLink, Reveal } from "./ui";
import { ShippedLedger } from "./shipped-ledger";

/* -------------------------------------------------- kinetic type ---- */

function FillWord({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

/**
 * A paragraph that inks itself in, word by word, as it is read.
 * The scroll position is the reading position.
 */
function ScrollFillText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });
  const words = text.split(" ");
  if (reduced) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const start = (i / words.length) * 0.85;
        return (
          <FillWord
            key={`${w}-${i}`}
            word={w}
            progress={scrollYProgress}
            range={[start, start + 0.15]}
          />
        );
      })}
    </p>
  );
}

/* --------------------------------------------------- roll figures ---- */

/**
 * A figure that rolls up to its value like a counter drum when it
 * scrolls into view. The real value stays in the DOM for readers and
 * reduced motion; the roll is presentation.
 */
function RollFigure({ value, delay = 0 }: { value: string; delay?: number }) {
  const reduced = useReducedMotion();
  const n = Number(value);
  if (reduced || !Number.isInteger(n) || n < 0 || n > 9) return <>{value}</>;
  return (
    // The in-view trigger sits on the outer (visible) span: the rolling
    // column starts fully clipped by the mask, so observing it directly
    // would never fire.
    <motion.span
      className="relative inline-block overflow-hidden align-bottom"
      style={{ height: "1em" }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
    >
      <span className="sr-only">{value}</span>
      <span className="invisible leading-none" aria-hidden="true">{value}</span>
      <motion.span
        className="absolute left-0 top-0"
        variants={{
          hidden: { y: 0 },
          visible: { y: `${-n}em`, transition: { duration: 1.3, ease: EASE, delay } },
        }}
        aria-hidden="true"
      >
        {Array.from({ length: n + 1 }, (_, i) => (
          <span key={i} className="block leading-none" style={{ height: "1em" }}>
            {i}
          </span>
        ))}
      </motion.span>
    </motion.span>
  );
}

/* ------------------------------------------------- positioning strip */

const PRINCIPLES = [
  {
    n: "01",
    title: "One accountable partner",
    body: "Product, operations, and demand are one problem. Splitting them across three vendors is how projects die politely.",
  },
  {
    n: "02",
    title: "Systems, not deliverables",
    body: "A handover file is not an outcome. We ship things that run: software, automations, pipelines, and the discipline around them.",
  },
  {
    n: "03",
    title: "Flat fees, fixed scope",
    body: "Priced before work starts. No hourly meters, no scope drift, no surprise invoices. Commercial clarity is part of the craft.",
  },
];

export function PositioningStrip() {
  return (
    <section
      data-ground="ink"
      data-bp="S2 · Positioning — kinetic standfirst"
      className="section-pad border-t border-line bg-ink"
    >
      <div className="container-page">
        <ScrollFillText
          className="font-display max-w-3xl text-[1.5rem] leading-[1.45] text-t1 md:text-[1.9rem]"
          text="Most good ideas do not fail. They stall, waiting for a technical partner who can think through the business, not just the build. Sarga Haus exists for that gap."
        />
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.1}>
              <div className="border-t border-line pt-5">
                <p className="label text-accent">{p.n}</p>
                <h3 className="mt-3 text-[1.0625rem] font-medium text-t1">{p.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-t2">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.25}>
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {[
              ["4", "products shipped and live"],
              ["2", "platforms: web and iOS"],
              ["5", "fixed-scope offers"],
              ["1", "studio accountable for all of it"],
            ].map(([n, d], i) => (
              <div key={d} data-torch className="bg-raised px-6 py-6">
                <p className="font-display text-[2.4rem] leading-none text-t1" style={{ fontWeight: 470 }}>
                  <RollFigure value={n} delay={0.15 + i * 0.12} />
                </p>
                <p className="mt-2 text-[0.8125rem] leading-snug text-t2">{d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------- builds preview */

export function BuildsPreview() {
  return (
    <section data-ground="ink" data-bp="S9 · Selected builds — shipped ledger" className="section-pad border-t border-line bg-ink">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal>
              <p className="label text-accent">Shipped work</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display-m mt-5 text-t1">Built here. Live now.</h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <InlineLink href="/builds">All builds</InlineLink>
          </Reveal>
        </div>
        <div className="mt-12">
          <ShippedLedger variant="preview" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------- founder statement */

const CONVICTIONS = [
  "Ideas matter only when they become operating systems.",
  "Products matter only when people use them.",
  "Automation should remove friction, not judgment.",
  "Growth should be designed into the system, not bolted on after.",
];

export function FounderStatement() {
  return (
    <section data-ground="bone" data-bp="S10 · Conviction" className="section-pad bg-bone">
      <div className="container-page grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Reveal>
            <p className="label text-accent">Why we exist</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-m mt-5 text-t1">Built by an operator, for operators.</h2>
          </Reveal>
          <Reveal delay={0.16} className="mt-6">
            <InlineLink href="/about">The full conviction</InlineLink>
          </Reveal>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <ul>
            {CONVICTIONS.map((c, i) => (
              <Reveal key={c} as="li" delay={i * 0.12} className="border-t border-line py-6 last:border-b">
                <p className="font-display text-[1.35rem] leading-snug text-t1 md:text-[1.6rem]" style={{ fontWeight: 440 }}>
                  {c}
                </p>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.5}>
            <p className="mt-8 max-w-lg text-[0.9375rem] leading-relaxed text-t2">
              Sarga Haus is for people who want someone to think through the
              business, build the product, automate the operation, and help
              create traction. Not a vendor. A build partner with skin in the craft.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- final CTA */

export function FinalCta() {
  const reduced = useReducedMotion();
  const draw = (delay: number) => ({
    hidden: { strokeDashoffset: 1, opacity: 0 },
    visible: {
      strokeDashoffset: 0,
      opacity: 1,
      transition: { duration: 1.8, ease: EASE, delay },
    },
  });
  return (
    <section
      data-ground="ink"
      data-bp="S12 · Final CTA — the mark draws itself"
      className="lamplight-center relative overflow-hidden bg-ink"
    >
      <div className="container-page relative flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <motion.svg
          aria-hidden="true"
          width={560}
          height={560}
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
          initial={reduced ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.path
            d="M8 3.5 H17 Q20.5 3.5 20.5 7 V17 Q20.5 20.5 17 20.5 H10"
            stroke="var(--color-cream)"
            strokeWidth="1.2"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            variants={draw(0.1)}
          />
          <motion.path
            d="M3.5 16.5 V7 Q3.5 3.5 7 3.5"
            stroke="var(--color-cream)"
            strokeWidth="1.2"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            variants={draw(0.7)}
          />
          <motion.path
            d="M2.5 21.5 L6.5 17.5"
            stroke="var(--color-brass-bright)"
            strokeWidth="1.2"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            variants={draw(1.2)}
          />
        </motion.svg>
        <Reveal>
          <p className="label text-accent">The last word</p>
        </Reveal>
        <motion.h2
          className="display-xl relative mt-8 max-w-4xl text-cream"
          initial={reduced ? undefined : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay: 0.15 } },
          }}
        >
          If it is real, it deserves to exist.
        </motion.h2>
        <Reveal delay={0.35}>
          <p className="standfirst mx-auto mt-8 max-w-xl text-cream-dim">
            Bring the idea, the bottleneck, or the broken workflow. Sarga Haus
            will help turn it into a working system.
          </p>
        </Reveal>
        <Reveal delay={0.5} className="mt-10">
          <PrimaryLink href="/start">Start a project</PrimaryLink>
        </Reveal>
      </div>
    </section>
  );
}
