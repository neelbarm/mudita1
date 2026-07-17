import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/ui";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Notes from the studio on building products, automating operations, and constructing pipelines. Published only when there is something to say.",
};

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
          <div data-torch className="mx-auto max-w-2xl rounded-2xl border border-line bg-raised p-10 text-center">
            <Reveal>
              <p className="label text-accent">Nothing here yet, on purpose</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-t2">
                The first essays are being written. Content exists here to be
                useful, not to feed an algorithm, so the page stays empty until
                the writing clears that bar.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 border-t border-line pt-6 text-left">
                <p className="label text-t3">In the drafts folder</p>
                <ul className="mt-4 space-y-3">
                  {UPCOMING.map((t) => (
                    <li key={t} className="flex gap-3 text-[0.9375rem] text-t2">
                      <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
