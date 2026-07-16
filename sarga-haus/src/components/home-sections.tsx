"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE, VIEWPORT } from "@/lib/motion";
import { InlineLink, PrimaryLink, Reveal } from "./ui";
import { BUILDS } from "@/lib/builds";
import { Mark } from "./logo";

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
    <section data-ground="ink" className="section-pad border-t border-line bg-ink">
      <div className="container-page">
        <Reveal>
          <p className="standfirst max-w-3xl text-t1">
            Most good ideas do not fail. They stall, waiting for a technical
            partner who can think through the business, not just the build.
            Sarga Haus exists for that gap.
          </p>
        </Reveal>
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
      </div>
    </section>
  );
}

/* --------------------------------------------------- builds preview */

export function BuildsPreview() {
  return (
    <section data-ground="ink" className="section-pad border-t border-line bg-ink">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal>
              <p className="label text-accent">Selected builds</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display-m mt-5 text-t1">The work, without the theater.</h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <InlineLink href="/builds">All builds</InlineLink>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BUILDS.map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.08}>
              <Link
                href={`/builds#${b.slug}`}
                className="group block h-full rounded-2xl border border-line bg-raised p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong"
              >
                <div className="flex items-center justify-between">
                  <span className="label text-t3">{b.category}</span>
                  <span className="label text-t3">
                    {b.status === "client" ? "Client work" : "Illustrative"}
                  </span>
                </div>
                <h3 className="mt-5 text-[1.0625rem] font-medium leading-snug text-t1">
                  {b.title}
                </h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-t2">
                  {b.challenge}
                </p>
                <span className="mt-5 inline-block text-[0.875rem] text-accent">
                  Read the system
                </span>
              </Link>
            </Reveal>
          ))}
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
    <section data-ground="bone" className="section-pad bg-bone">
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
  return (
    <section data-ground="ink" className="relative overflow-hidden bg-ink">
      <div className="container-page relative flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cream opacity-[0.05]"
          initial={reduced ? false : { scale: 1.06 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 2.4, ease: EASE }}
        >
          <Mark size={560} />
        </motion.div>
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
