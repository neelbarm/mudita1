"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowRight } from "lucide-react";
import { riseIn, VIEWPORT } from "@/lib/motion";
import type { ReactNode } from "react";

/* ----------------------------------------------------------- buttons */

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[0.9375rem] font-medium transition-all duration-300 active:scale-[0.98]";

export function PrimaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${base} group bg-t1 text-ground hover:bg-accent hover:text-ink ${className}`}
    >
      {children}
      <ArrowRight
        size={16}
        strokeWidth={1.75}
        className="transition-transform duration-300 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${base} border border-line-strong text-t1 hover:border-t2 hover:bg-t1/5 ${className}`}
    >
      {children}
    </Link>
  );
}

export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-t1 underline decoration-line-strong underline-offset-4 transition-colors duration-300 hover:text-accent hover:decoration-accent"
    >
      {children}
      <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}

/* ------------------------------------------------------------ reveal */

export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "p" | "h2" | "h3" | "li" | "section";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduced ? undefined : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={riseIn}
      custom={delay}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------- section header */

export function SectionHeader({
  eyebrow,
  title,
  standfirst,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  standfirst?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <Reveal>
        <p className="label text-accent">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display-m mt-5 text-t1">{title}</h2>
      </Reveal>
      {standfirst ? (
        <Reveal delay={0.16}>
          <p className="standfirst mt-5 text-t2">{standfirst}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
