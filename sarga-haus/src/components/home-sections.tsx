"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowRight } from "lucide-react";
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

/* ------------------------------------------------ the short version ---- */

const SHORT_VERSION = [
  ["We build your product.", "Design, code, launch, in weeks."],
  ["We automate your operation.", "Intake, follow-up, and invoices run themselves."],
  ["We fill your pipeline.", "Real outreach to real people, every message approved by a person."],
] as const;

/**
 * The girlfriend test: one scroll in, the whole pitch in plain
 * language. The first flip to bone doubles as the lights coming on.
 */
export function ShortVersion() {
  return (
    <section
      id="the-point"
      data-ground="bone"
      data-bp="S1b · The short version — lights-on strip"
      className="bg-bone py-20 md:py-28"
    >
      <div className="container-page grid gap-10 md:grid-cols-[1fr_1.7fr] md:gap-16">
        <Reveal>
          <div>
            <p className="label text-accent">The short version</p>
            <h2
              className="serif-italic mt-5 text-t1"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", lineHeight: 1.05 }}
            >
              Lights on.
            </h2>
            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-t2">
              One studio, one flat fee, priced before work starts. The rest of
              this page is proof.
            </p>
          </div>
        </Reveal>
        <div>
          <ul className="divide-y divide-line border-y border-line">
            {SHORT_VERSION.map(([head, body], i) => (
              <Reveal key={head} delay={0.08 * i}>
                <li className="flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:gap-6 md:py-6">
                  <p className="shrink-0 text-[1.0625rem] font-medium text-t1 md:w-64">
                    {head}
                  </p>
                  <p className="text-[0.9375rem] leading-relaxed text-t2">{body}</p>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <PrimaryLink href="/start">Start a project</PrimaryLink>
              <InlineLink href="/audit">or take the two minute audit</InlineLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

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
        {/* The proof board: the studio at a glance, bento-style. Every
            figure on it is a running fact, not a promise. */}
        <div className="mt-16 grid auto-rows-[minmax(9.5rem,auto)] grid-cols-2 gap-3 md:auto-rows-[minmax(10.5rem,auto)] md:grid-cols-4 md:gap-4">
          <Reveal className="col-span-2 row-span-2" delay={0}>
            <div data-torch className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line bg-raised p-6 transition-all duration-300 hover:scale-[1.015] hover:border-accent/50 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <p className="label text-accent">Shipped and live</p>
                <InlineLink href="/builds">All builds</InlineLink>
              </div>
              <p className="font-display mt-4 text-[5.5rem] leading-none text-t1 md:text-[7rem]" style={{ fontWeight: 470 }}>
                <RollFigure value="4" delay={0.15} />
              </p>
              <div className="mt-4">
                <p className="text-[0.9375rem] leading-relaxed text-t2">
                  Products in the world today: EverPage, The Common Collective,
                  Styloire, and Taxflow on iOS. Real work labeled real,
                  illustrative work labeled illustrative.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal className="col-span-2" delay={0.08}>
            <div data-torch className="flex h-full flex-col justify-between rounded-3xl border border-line bg-raised p-6 transition-all duration-300 hover:scale-[1.015] hover:border-accent/50 md:p-7">
              <p className="label text-accent">The machine</p>
              <p className="mt-3 text-[1.05rem] leading-snug text-t1">
                <strong className="font-display text-[1.6rem]" style={{ fontWeight: 470 }}>17</strong>{" "}
                supervised agents draft the work. A named person approves
                every piece before it moves. The gate is code, not policy.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.14}>
            <div data-torch className="flex h-full flex-col justify-between rounded-3xl border border-line bg-raised p-6 transition-all duration-300 hover:scale-[1.015] hover:border-accent/50">
              <p className="label text-t3">Outreach, daily cap</p>
              <div>
                <p className="font-display text-[2.6rem] leading-none text-t1" style={{ fontWeight: 470 }}>
                  <RollFigure value="15" delay={0.25} />
                </p>
                <p className="mt-2 text-[0.8125rem] leading-snug text-t2">sends a day, never more</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div data-torch className="flex h-full flex-col justify-between rounded-3xl border border-line bg-raised p-6 transition-all duration-300 hover:scale-[1.015] hover:border-accent/50">
              <p className="label text-t3">Opting out</p>
              <div>
                <p className="font-display text-[2.6rem] leading-none text-t1" style={{ fontWeight: 470 }}>
                  <RollFigure value="1" delay={0.3} />
                </p>
                <p className="mt-2 text-[0.8125rem] leading-snug text-t2">click, honored permanently</p>
              </div>
            </div>
          </Reveal>
          <Reveal className="col-span-2" delay={0.26}>
            <div data-torch className="flex h-full flex-col justify-between rounded-3xl border border-line bg-raised p-6 transition-all duration-300 hover:scale-[1.015] hover:border-accent/50 md:p-7">
              <p className="label text-accent">Pricing</p>
              <p className="mt-3 text-[1.05rem] leading-snug text-t1">
                <strong className="font-display text-[1.6rem]" style={{ fontWeight: 470 }}>5</strong>{" "}
                fixed-scope offers. Flat fee, priced before work starts,
                never by the hour.
              </p>
            </div>
          </Reveal>
          <Reveal className="col-span-2" delay={0.32}>
            <Link
              href="/audit"
              data-ground="bone"
              data-cursor-label="Audit"
              className="group flex h-full flex-col justify-between rounded-3xl border border-line bg-bone p-6 transition-all duration-300 hover:scale-[1.015] hover:border-accent md:p-7"
            >
              <p className="label text-accent">The Operations Audit</p>
              <div className="flex items-end justify-between gap-4">
                <p className="text-[1.05rem] leading-snug text-t1">
                  Ten questions, two minutes: is your business a system or a
                  heroic effort?
                </p>
                <ArrowRight
                  aria-hidden="true"
                  size={20}
                  strokeWidth={1.75}
                  className="mb-1 shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </div>
            </Link>
          </Reveal>
        </div>
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

/* ---------------------------------------------- governed-facts ticker */

const TICKER_FACTS = [
  "Every message approved by a person",
  "Fifteen sends a day, never more",
  "Opt-outs honored permanently",
  "Four touches, then a clean close",
  "Flat fee, priced before work starts",
  "We run on the system we sell",
  "Agents draft, humans decide",
];

/**
 * The house rules on a slow lap. Facts only, each one enforced in
 * code somewhere in the studio. Hover pauses; reduced motion gets a
 * static wrapped list instead of a loop.
 */
export function GovernedTicker() {
  return (
    <section
      aria-label="How the studio governs itself"
      data-ground="ink"
      data-bp="S11b · Governed facts — one slow lap"
      className="overflow-hidden border-t border-line bg-ink py-6"
    >
      <div className="ticker-track">
        {[1, 2].map((copy) => (
          <div
            key={copy}
            data-ticker-copy={copy}
            aria-hidden={copy === 2 ? "true" : undefined}
            className="flex shrink-0 items-center gap-10 pr-10"
          >
            {TICKER_FACTS.map((f) => (
              <span key={f} className="flex items-center gap-10 whitespace-nowrap">
                <span className="label text-cream-faint">{f}</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brass" />
              </span>
            ))}
          </div>
        ))}
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
