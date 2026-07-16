"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";

export function PageHero({
  eyebrow,
  title,
  standfirst,
}: {
  eyebrow: string;
  title: string;
  standfirst?: string;
}) {
  const reduced = useReducedMotion();
  const anim = (delay: number) => ({
    initial: reduced ? false : ({ opacity: 0, y: 18 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  });
  return (
    <header data-ground="ink" data-bp="H · Page hero" className="bg-ink pb-16 pt-40 md:pb-24 md:pt-48">
      <div className="container-page max-w-4xl">
        <motion.p className="label text-brass-bright" {...anim(0.1)}>
          {eyebrow}
        </motion.p>
        <motion.h1 className="display-l mt-6 text-cream" {...anim(0.22)}>
          {title}
        </motion.h1>
        {standfirst ? (
          <motion.p className="standfirst mt-6 max-w-2xl text-cream-dim" {...anim(0.34)}>
            {standfirst}
          </motion.p>
        ) : null}
      </div>
    </header>
  );
}
