import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/ui";

export const metadata: Metadata = {
  title: "The DM is a queue with no exit",
  description:
    "When a service business takes bookings over DMs, the thread becomes the system: intake form, calendar, payment reminder, and waitlist, all held together by one person's attention.",
};

const PARAGRAPHS = [
  "Every service business has a system. The question is whether anyone designed it.",
  "When a studio takes bookings over Instagram DMs, the DM thread becomes the system: intake form, calendar, payment reminder, and waitlist, all at once, all held together by one person's attention. It works, in the way a kitchen drawer works. Everything is in there. Nothing can be found twice the same way.",
  "The cost hides in the switching. Two hours a day of message triage is not two hours of work; it is two hundred small decisions that each pull attention away from the actual craft. The operator feels busy because they are busy. The business feels stuck because the busyness produces no compounding structure.",
  "Here is the test: if you disappeared for a week, would bookings still happen? If the answer is no, the DMs are not a channel. They are a single point of failure wearing a friendly interface.",
  "The fix is rarely a bigger tool. Studio suites fail here precisely because they replace a personal system with an institutional one. The fix is a small system shaped like the operation: a schedule that books itself, a waitlist that fills its own gaps, and a morning summary that turns two hours of triage into two minutes of reading.",
  "A system is not the opposite of the personal touch. It is what protects the time the personal touch comes from.",
];

export default function EssayPage() {
  return (
    <>
      <PageHero
        eyebrow="Journal · July 2026"
        title="The DM is a queue with no exit."
        standfirst="On what it really costs when the booking system is a message thread, and what a system shaped like the operation looks like instead."
      />
      <div data-ground="bone" className="bg-bone">
        <article className="container-page section-pad">
          <div className="mx-auto max-w-2xl">
            {PARAGRAPHS.map((p, i) => (
              <Reveal key={i} as="p" delay={Math.min(i * 0.05, 0.2)} className={i === 0 ? "" : "mt-6"}>
                <span
                  className={
                    i === 0
                      ? "font-display block text-[1.35rem] leading-snug text-t1 md:text-[1.55rem]"
                      : "block text-[1.0325rem] leading-[1.75] text-t2"
                  }
                >
                  {p}
                </span>
              </Reveal>
            ))}
            <Reveal delay={0.25}>
              <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
                <Link
                  href="/journal"
                  className="inline-flex items-center gap-2 text-[0.875rem] text-t2 transition-colors hover:text-t1"
                >
                  <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
                  Back to the journal
                </Link>
                <p className="label text-t3">Sarga Haus</p>
              </div>
            </Reveal>
          </div>
        </article>
      </div>
    </>
  );
}
