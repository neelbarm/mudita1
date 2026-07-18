"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { Plus } from "lucide-react";
import { EASE } from "@/lib/motion";
import { Reveal } from "./ui";

const FAQS = [
  {
    q: "What does an engagement cost?",
    a: "Flat fees, agreed before work starts. Validation sprints sit in the low five figures or under; build, automation, and pipeline sprints range with scope; the Growth Partnership is a monthly retainer. Exact guidance per offer is on the Services page. No hourly billing, ever.",
  },
  {
    q: "Who actually does the work? Is this AI?",
    a: "Founder-led means a person scopes, decides, and answers for everything. Behind that person runs a studio operating system with seventeen supervised agents that draft research, outreach, reports, and paperwork. Draft is the key word: every client-facing artifact is approved by a named human before it goes anywhere, the agents hold no send, sign, or bill authority, and those gates are enforced in code and at the database layer, not by good intentions. You get the leverage of the machine and the judgment of a human, in that order of visibility and the reverse order of authority.",
  },
  {
    q: "How fast is a sprint?",
    a: "Validation runs about two weeks. Build, automation, and pipeline sprints typically run three to six weeks depending on scope. You see working output every week, not a report at the end.",
  },
  {
    q: "Do you take equity instead of fees?",
    a: "Rarely, and never casually. The default is flat-fee work. In selective cases where the opportunity and the operator justify it, we may propose a mixed structure. That conversation starts with us, not with a discount request.",
  },
  {
    q: "Who is this for?",
    a: "Nontechnical, ambitious operators: founders, creators, consultants, coaches, agency and service business owners. If your operation lives in spreadsheets, inboxes, and DMs and you know it should be a system, you are the person this studio was built for.",
  },
  {
    q: "Do you guarantee leads or revenue?",
    a: "No, and we put that in writing. We build pipeline infrastructure: targeting, enrichment, outreach systems with human approval, CRM motion, and honest weekly reporting. Anyone guaranteeing lead volume is selling you their optimism.",
  },
  {
    q: "What happens after launch?",
    a: "Either a clean handover with documentation and a walkthrough, or a Growth Partnership: monthly improvements, measurement, and further automation. The retainer has to re-earn itself every quarter.",
  },
  {
    q: "Who owns the code and the systems?",
    a: "You do. Everything is built on a modern, boring-in-the-good-way stack under your accounts: your repository, your database, your domains. No lock-in, no hostage infrastructure.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <section data-ground="bone" data-bp="S11 · FAQ — accordion" className="section-pad bg-bone" id="faq">
      <div className="container-page grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Reveal>
            <p className="label text-accent">Questions</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-m mt-5 text-t1">Asked before, answered straight.</h2>
          </Reveal>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.04}>
                <div className="border-t border-line last:border-b">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex min-h-11 w-full items-center justify-between gap-6 py-5 text-left"
                    >
                      <span className="text-[1.0625rem] font-medium text-t1">{f.q}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
                        className="shrink-0 text-t3"
                        aria-hidden="true"
                      >
                        <Plus size={18} strokeWidth={1.5} />
                      </motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="panel"
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-button-${i}`}
                        initial={reduced ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduced ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-xl pb-6 text-[0.9375rem] leading-relaxed text-t2">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
