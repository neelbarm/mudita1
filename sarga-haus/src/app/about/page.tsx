import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PrimaryLink, Reveal } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sarga Haus is a founder-led product studio built on one conviction: ideas matter only when they become operating systems.",
};

const BELIEFS = [
  {
    title: "Ideas matter only when they become operating systems.",
    body: "An idea in a notes app is a liability: it costs attention and produces nothing. The moment it becomes a system, with users, data, and motion, it starts paying for itself. Everything this studio does is that conversion.",
  },
  {
    title: "Products matter only when people use them.",
    body: "Shipping is not the finish line. A product without a pipeline is just a project, which is why demand infrastructure is built here alongside the product, not bolted on after the launch party.",
  },
  {
    title: "Automation should remove friction, not judgment.",
    body: "We automate the repetitive and keep humans on the consequential. Every system we ship has explicit approval points, because a business that cannot exercise judgment is not automated, it is abandoned.",
  },
  {
    title: "Growth should be designed into the system.",
    body: "Measurement, follow-up, reporting, and improvement are architecture decisions, not campaigns. A system that cannot tell you how it is doing was built wrong.",
  },
];

const PRACTICE = [
  "Flat fees, agreed before work starts",
  "Weekly ships, not monthly reports",
  "You own everything: code, data, accounts",
  "Explicit scope lines, with exclusions in writing",
  "No fake proof, no invented numbers, no borrowed logos",
  "Equity or revenue share only when we propose it, which is rare",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="A studio for people who are done waiting for a technical partner."
        standfirst="Sarga Haus was built for operators: founders, creators, consultants, and service business owners who have something real and need it turned into a working system."
      />
      <div data-ground="bone" className="bg-bone">
        <div className="container-page section-pad">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <Reveal>
                <p className="label text-accent">The conviction</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="display-m mt-5 text-t1">What this studio believes.</h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-8 text-[0.9375rem] leading-relaxed text-t2">
                  Founder-led means the person who scopes your system is the
                  person accountable for it working. No account managers, no
                  telephone game between strategy and code.
                </p>
              </Reveal>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              {BELIEFS.map((b, i) => (
                <Reveal key={b.title} delay={i * 0.08}>
                  <div className="border-t border-line py-8 first:pt-0 first:border-t-0">
                    <h3 className="font-display text-[1.4rem] leading-snug text-t1 md:text-[1.65rem]" style={{ fontWeight: 440 }}>
                      {b.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-t2">{b.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-24 grid gap-12 border-t border-line pt-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <Reveal>
                <p className="label text-accent">How we practice</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="display-s mt-5 text-t1">
                  Discipline is the brand.
                </h2>
              </Reveal>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <ul className="space-y-3">
                {PRACTICE.map((p, i) => (
                  <Reveal key={p} as="li" delay={i * 0.05}>
                    <span className="flex gap-3 border-t border-line pt-3 text-[0.9375rem] leading-relaxed text-t2">
                      <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                      {p}
                    </span>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-24 border-t border-line pt-16">
            <Reveal>
              <p className="serif-italic mx-auto max-w-2xl text-center text-[1.3rem] leading-relaxed text-t2">
                Sarga: the act of bringing something into form. Haus: the place
                where it happens. Said sar-gah house.
              </p>
            </Reveal>
            <Reveal delay={0.15} className="mt-10 text-center">
              <PrimaryLink href="/start">Bring something real</PrimaryLink>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
