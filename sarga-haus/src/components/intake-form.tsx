"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { EASE } from "@/lib/motion";
import {
  BUDGETS,
  CATEGORIES,
  TIMELINES,
  validateIntake,
  type IntakePayload,
} from "@/lib/intake";
import { Mark } from "./logo";

/**
 * The Start a Project flow: four calm steps, validated per step,
 * with real loading, error, and thank-you states. Feels like
 * onboarding, not a contact form.
 */

type FormState = Omit<IntakePayload, "website">;

const EMPTY: FormState = {
  name: "",
  email: "",
  company: "",
  link: "",
  building: "",
  broken: "",
  impact: "",
  category: "",
  timeline: "",
  budget: "",
  tools: "",
  notes: "",
};

const STEPS = [
  { id: "you", title: "About you", hint: "So the reply is addressed to a person, not a lead." },
  { id: "work", title: "The work", hint: "Plain language beats polish here. Say it how you would to a friend." },
  { id: "shape", title: "The shape", hint: "This routes your brief to the right kind of sprint." },
  { id: "context", title: "Context", hint: "Optional, and genuinely useful if you have it." },
] as const;

const STEP_FIELDS: Array<Array<keyof FormState>> = [
  ["name", "email", "company", "link"],
  ["building", "broken", "impact"],
  ["category", "timeline", "budget"],
  ["tools", "notes"],
];

const inputCls =
  "w-full rounded-xl border border-line-strong bg-transparent px-4 py-3 text-[0.9375rem] text-t1 placeholder:text-t3 transition-colors duration-300 focus:border-accent focus:outline-none";
const labelCls = "block text-[0.875rem] font-medium text-t1";

function Field({
  label,
  optional,
  error,
  children,
  id,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
        {optional && <span className="ml-2 font-normal text-t3">optional</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-[0.8125rem] text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function RadioCards<T extends { value: string; label: string; hint?: string }>({
  name,
  options,
  value,
  onChange,
  error,
  legend,
  columns = 2,
}: {
  name: string;
  options: readonly T[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  legend: string;
  columns?: number;
}) {
  return (
    <fieldset>
      <legend className={labelCls}>{legend}</legend>
      <div className={`mt-3 grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <label
              key={o.value}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors duration-200 ${
                selected
                  ? "border-accent bg-t1/5"
                  : "border-line-strong hover:border-t3"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="mt-1 h-3.5 w-3.5 shrink-0 accent-[var(--color-brass)]"
              />
              <span>
                <span className="block text-[0.9375rem] font-medium text-t1">{o.label}</span>
                {o.hint ? (
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-t2">{o.hint}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-[0.8125rem] text-accent">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function IntakeForm() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  const set = (key: keyof FormState) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const stepValid = (index: number) => {
    const { errors: all } = validateIntake(form);
    const relevant: typeof errors = {};
    for (const f of STEP_FIELDS[index]) {
      if (all[f]) relevant[f] = all[f];
    }
    setErrors(relevant);
    return Object.keys(relevant).length === 0;
  };

  const goTo = (next: number) => {
    setStep(next);
    // Move focus to the step heading so keyboard and screen reader users track.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const onNext = () => {
    if (stepValid(step)) goTo(step + 1);
  };

  const onSubmit = async () => {
    if (!stepValid(step)) return;
    const { valid } = validateIntake(form);
    if (!valid) return;
    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setServerError(
          data.error || "Something went wrong on our side. Please try again, or email studio@sargahaus.com."
        );
      }
    } catch {
      setStatus("error");
      setServerError("The connection dropped. Please try again, or email studio@sargahaus.com.");
    }
  };

  if (status === "done") {
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mx-auto max-w-xl text-center"
      >
        <motion.div
          className="mx-auto flex h-16 w-16 items-center justify-center text-cream"
          initial={reduced ? false : { rotate: -8, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        >
          <Mark size={56} />
        </motion.div>
        <h2 className="display-m mt-8 text-t1">Received. A person will read it.</h2>
        <div className="mt-8 space-y-4 text-left">
          {[
            "We review your brief, usually within one business day.",
            "If it looks like a fit, you get a reply with a call link and one or two sharp questions.",
            "If it is not a fit, you get a straight answer, not silence.",
          ].map((line, i) => (
            <div key={line} className="flex gap-4 rounded-xl border border-line bg-raised px-5 py-4">
              <span className="label mt-1 shrink-0 text-accent">0{i + 1}</span>
              <p className="text-[0.9375rem] leading-relaxed text-t2">{line}</p>
            </div>
          ))}
        </div>
        {bookingUrl ? (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-9 inline-flex min-h-11 items-center gap-2 rounded-full bg-t1 px-6 py-2.5 text-[0.9375rem] font-medium text-ground transition-colors hover:bg-accent hover:text-ink"
          >
            Skip the wait, book the call now
            <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </a>
        ) : (
          <p className="mt-9 text-[0.875rem] text-t3">
            Check your inbox for a confirmation with the same next steps.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* progress */}
      <div aria-hidden="true" className="mb-10 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded bg-line">
            <motion.div
              className="h-full bg-accent"
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
            />
          </div>
        ))}
      </div>
      <p className="label text-t3">
        Step {step + 1} of {STEPS.length}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < STEPS.length - 1) onNext();
          else onSubmit();
        }}
        noValidate
      >
        {/* honeypot */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="website">Leave this field empty</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="display-s mt-3 text-t1 focus:outline-none"
            >
              {STEPS[step].title}
            </h2>
            <p className="mt-2 text-[0.9375rem] text-t2">{STEPS[step].hint}</p>

            <div className="mt-8 space-y-6">
              {step === 0 && (
                <>
                  <Field id="name" label="Name" error={errors.name}>
                    <input
                      id="name"
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => set("name")(e.target.value)}
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                  </Field>
                  <Field id="email" label="Email" error={errors.email}>
                    <input
                      id="email"
                      type="email"
                      className={inputCls}
                      value={form.email}
                      onChange={(e) => set("email")(e.target.value)}
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </Field>
                  <Field id="company" label="Company or project" optional error={errors.company}>
                    <input
                      id="company"
                      className={inputCls}
                      value={form.company}
                      onChange={(e) => set("company")(e.target.value)}
                      autoComplete="organization"
                    />
                  </Field>
                  <Field id="link" label="Website or social link" optional error={errors.link}>
                    <input
                      id="link"
                      type="url"
                      className={inputCls}
                      value={form.link}
                      onChange={(e) => set("link")(e.target.value)}
                      placeholder="https://"
                      inputMode="url"
                    />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <Field id="building" label="What are you trying to build?" error={errors.building}>
                    <textarea
                      id="building"
                      rows={4}
                      className={inputCls}
                      value={form.building}
                      onChange={(e) => set("building")(e.target.value)}
                      placeholder="The product, system, or outcome you want to exist."
                      aria-invalid={!!errors.building}
                      aria-describedby={errors.building ? "building-error" : undefined}
                    />
                  </Field>
                  <Field id="broken" label="What is broken today?" optional error={errors.broken}>
                    <textarea
                      id="broken"
                      rows={3}
                      className={inputCls}
                      value={form.broken}
                      onChange={(e) => set("broken")(e.target.value)}
                      placeholder="The manual work, the missed follow-ups, the spreadsheet that runs everything."
                    />
                  </Field>
                  <Field id="impact" label="What would this change for the business?" optional error={errors.impact}>
                    <textarea
                      id="impact"
                      rows={3}
                      className={inputCls}
                      value={form.impact}
                      onChange={(e) => set("impact")(e.target.value)}
                      placeholder="Hours back, revenue unlocked, clients served without chaos."
                    />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <RadioCards
                    name="category"
                    legend="Which is closest?"
                    options={CATEGORIES}
                    value={form.category}
                    onChange={set("category")}
                    error={errors.category}
                  />
                  <RadioCards
                    name="timeline"
                    legend="Timeline"
                    options={TIMELINES}
                    value={form.timeline}
                    onChange={set("timeline")}
                    error={errors.timeline}
                    columns={1}
                  />
                  <RadioCards
                    name="budget"
                    legend="Budget range"
                    options={BUDGETS}
                    value={form.budget}
                    onChange={set("budget")}
                    error={errors.budget}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <Field id="tools" label="What tools run the business today?" optional error={errors.tools}>
                    <textarea
                      id="tools"
                      rows={3}
                      className={inputCls}
                      value={form.tools}
                      onChange={(e) => set("tools")(e.target.value)}
                      placeholder="Notion, Sheets, Stripe, a CRM, email, DMs. Whatever is true."
                    />
                  </Field>
                  <Field id="notes" label="Anything else?" optional error={errors.notes}>
                    <textarea
                      id="notes"
                      rows={3}
                      className={inputCls}
                      value={form.notes}
                      onChange={(e) => set("notes")(e.target.value)}
                    />
                  </Field>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {status === "error" && (
          <p role="alert" className="mt-6 rounded-xl border border-accent/50 px-4 py-3 text-[0.875rem] text-accent">
            {serverError}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.9375rem] text-t2 transition-colors hover:text-t1"
            >
              <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
              Back
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-t1 px-7 py-2.5 text-[0.9375rem] font-medium text-ground transition-all duration-300 hover:bg-accent hover:text-ink active:scale-[0.98]"
            >
              Continue
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-t1 px-7 py-2.5 text-[0.9375rem] font-medium text-ground transition-all duration-300 hover:bg-accent hover:text-ink active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {status === "submitting" ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 animate-spin rounded-full border border-ground border-t-transparent"
                  />
                  Sending
                </>
              ) : (
                <>
                  Send the brief
                  <Check size={16} strokeWidth={1.75} aria-hidden="true" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
