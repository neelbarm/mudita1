"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowLeft } from "lucide-react";
import { EASE } from "@/lib/motion";
import { AUDIT, MAX_SCORE, categoryFor, verdictFor } from "@/lib/audit";
import { PrimaryLink } from "./ui";

/**
 * The Operations Audit flow: one question at a time, an honest scored
 * diagnosis, and an optional handoff into the real intake so a person
 * replies. No tracking, no gimmicks; the diagnosis is the value.
 */

type Phase = "asking" | "result";

export function AuditFlow() {
  const reduced = useReducedMotion();
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("asking");
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [contact, setContact] = useState({ name: "", email: "" });

  const step = answers.length;
  const question = AUDIT[step];

  const pick = (score: number) => {
    const next = [...answers, score];
    setAnswers(next);
    if (next.length === AUDIT.length) {
      setTimeout(() => setPhase("result"), reduced ? 0 : 250);
    }
  };

  const back = () => {
    if (phase === "result") setPhase("asking");
    setAnswers((a) => a.slice(0, -1));
  };

  const total = answers.reduce((s, a) => s + a, 0);
  const verdict = verdictFor(total);
  const findings = AUDIT.map((q, i) => {
    const opt = q.options.find((o) => o.score === answers[i]);
    return opt?.finding ? { area: q.area, text: opt.finding, score: answers[i]! } : null;
  })
    .filter((f) => f != null)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);

  async function sendToStudio(e: React.FormEvent) {
    e.preventDefault();
    setSendState("sending");
    const summary = AUDIT.map((q, i) => {
      const opt = q.options.find((o) => o.score === answers[i]);
      return `${q.area}: ${opt?.label ?? "?"} (${answers[i]}/2)`;
    }).join("\n");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name,
          email: contact.email,
          building: `Operations Audit result: ${total}/${MAX_SCORE}, "${verdict.name}". Weakest areas: ${findings.map((f) => f.area).join(", ") || "none flagged"}.`,
          category: categoryFor(answers),
          timeline: "exploring",
          budget: "unsure",
          notes: `Self-served audit answers:\n${summary}`,
          website: "",
        }),
      });
      setSendState(res.ok ? "sent" : "error");
    } catch {
      setSendState("error");
    }
  }

  if (phase === "result") {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="label text-accent">Your diagnosis</p>
        <h2 className="font-display mt-4 text-[2.2rem] leading-tight text-t1 md:text-[2.8rem]" style={{ fontWeight: 460 }}>
          {verdict.name}.
        </h2>
        <div className="mt-5 flex items-center gap-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-t1/10">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={reduced ? { width: `${(total / MAX_SCORE) * 100}%` } : { width: 0 }}
              animate={{ width: `${(total / MAX_SCORE) * 100}%` }}
              transition={{ duration: 1, ease: EASE }}
            />
          </div>
          <p className="font-display text-[1.3rem] text-t1" style={{ fontVariantNumeric: "tabular-nums" }}>
            {total}/{MAX_SCORE}
          </p>
        </div>
        <p className="mt-6 text-[1.0325rem] leading-[1.7] text-t2">{verdict.read}</p>

        {findings.length > 0 && (
          <div className="mt-8 rounded-2xl border border-line bg-raised p-6 md:p-7">
            <p className="label text-t3">What the audit noticed</p>
            <ul className="mt-4 space-y-4">
              {findings.map((f) => (
                <li key={f.area} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                  <span className="text-[0.9375rem] leading-relaxed text-t2">
                    <strong className="font-medium text-t1">{f.area}.</strong> {f.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-line bg-raised p-6 md:p-7">
          <p className="label text-accent">Where this points</p>
          <p className="mt-3 text-[1.0625rem] font-medium text-t1">{verdict.offer.name}</p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{verdict.offer.why}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <PrimaryLink href="/start">Start a project</PrimaryLink>
            <Link href="/services" className="text-[0.875rem] text-t2 underline decoration-line-strong underline-offset-4 hover:text-t1">
              See all five offers
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-6">
          {sendState === "sent" ? (
            <p className="text-[0.9375rem] leading-relaxed text-t2">
              Sent. A person reads every one of these and replies within one
              business day. No sequence, no newsletter, just an answer.
            </p>
          ) : (
            <form onSubmit={sendToStudio} className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
              <label className="sr-only" htmlFor="audit-name">Your name</label>
              <input
                id="audit-name"
                required
                value={contact.name}
                onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                placeholder="Your name"
                className="rounded-xl border border-line-strong bg-raised px-4 py-3 text-[0.9375rem] text-t1 placeholder:text-t3"
              />
              <label className="sr-only" htmlFor="audit-email">Email</label>
              <input
                id="audit-email"
                type="email"
                required
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                placeholder="you@company.com"
                className="rounded-xl border border-line-strong bg-raised px-4 py-3 text-[0.9375rem] text-t1 placeholder:text-t3"
              />
              <button
                type="submit"
                disabled={sendState === "sending"}
                className="rounded-xl bg-t1 px-5 py-3 text-[0.9375rem] font-medium text-ground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {sendState === "sending" ? "Sending..." : "Send my result to the studio"}
              </button>
              <p className="text-[0.8125rem] leading-relaxed text-t3 sm:col-span-3">
                Optional. It sends this diagnosis and your answers to the studio
                so a person can reply with an honest read. Nothing else happens
                to your email.{sendState === "error" ? " Something failed on the way; try once more." : ""}
              </p>
            </form>
          )}
          <button onClick={back} className="mt-6 inline-flex items-center gap-2 text-[0.875rem] text-t3 transition-colors hover:text-t1">
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
            Change my last answer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-baseline justify-between gap-6">
        <p className="label text-t3">
          Question {step + 1} of {AUDIT.length}
        </p>
        <p className="label text-accent">{question?.area}</p>
      </div>
      <div className="mt-3 h-px w-full bg-line">
        <motion.div
          className="h-px bg-accent"
          initial={false}
          animate={{ width: `${(step / AUDIT.length) * 100}%` }}
          transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <h2 className="font-display mt-8 text-[1.6rem] leading-snug text-t1 md:text-[2rem]" style={{ fontWeight: 455 }}>
            {question?.q}
          </h2>
          <div className="mt-7 grid gap-3">
            {question?.options.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => pick(o.score)}
                data-cursor-label="Pick"
                className="rounded-2xl border border-line bg-raised px-5 py-4 text-left text-[0.9975rem] leading-relaxed text-t2 transition-all duration-200 hover:border-accent/60 hover:text-t1 active:scale-[0.99]"
              >
                {o.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {step > 0 && (
        <button onClick={back} className="mt-8 inline-flex items-center gap-2 text-[0.875rem] text-t3 transition-colors hover:text-t1">
          <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
          Back
        </button>
      )}
    </div>
  );
}
