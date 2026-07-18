import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/ui";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Notes from the studio on building products, automating operations, and constructing pipelines. Published only when there is something to say.",
};

const ESSAYS = [
  {
    slug: "the-dm-is-a-queue-with-no-exit",
    date: "July 2026",
    minutes: 3,
    title: "The DM is a queue with no exit",
    excerpt:
      "When bookings live in a message thread, the thread becomes the system: intake, calendar, payments, and waitlist held together by one person's attention.",
  },
];

const UPCOMING = [
  "Why most MVPs are scoped backwards",
  "The approval point: where automation should stop",
  "Pipeline infrastructure for people who hate outreach",
];

export default function JournalPage() {
  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Notes from the studio."
        standfirst="Essays on turning ideas into operating systems. Published when there is something worth your attention, which means: not on a schedule."
      />
      <div data-ground="bone" className="bg-bone">
        <div className="container-page section-pad">
          <div className="mx-auto max-w-2xl">
            {ESSAYS.map((e, i) => (
              <Reveal key={e.slug} delay={i * 0.06}>
                <Link
                  href={`/journal/${e.slug}`}
                  data-cursor-label="Read"
                  className="group block border-t border-line py-8 transition-colors duration-300 last:border-b hover:bg-raised md:px-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <p className="label text-t3">{e.date}</p>
                    <p className="label text-t3">{e.minutes} minute read</p>
                  </div>
                  <h2
                    className="font-display mt-4 text-[1.5rem] leading-tight text-t1 md:text-[1.8rem]"
                    style={{ fontWeight: 450 }}
                  >
                    {e.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-t2">{e.excerpt}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] text-t3 transition-colors duration-300 group-hover:text-accent">
                    Read the essay
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </p>
                </Link>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <div data-torch className="mt-12 rounded-2xl border border-line bg-raised p-8">
                <p className="label text-t3">In the drafts folder</p>
                <ul className="mt-4 space-y-3">
                  {UPCOMING.map((t) => (
                    <li key={t} className="flex gap-3 text-[0.9375rem] text-t2">
                      <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-line pt-5 text-[0.8125rem] leading-relaxed text-t3">
                  Essays publish when the writing clears the bar of being
                  useful, not to feed an algorithm. Roughly one a month.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
