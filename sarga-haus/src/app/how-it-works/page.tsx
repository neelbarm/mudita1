import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PrimaryLink, Reveal } from "@/components/ui";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Clarify, Shape, Build, Launch, Improve. The five-stage Sarga Haus process: practical, premium, and easy to trust.",
  alternates: { canonical: "/how-it-works" },
};

const STAGES = [
  {
    index: "01",
    name: "Clarify",
    duration: "Days 1–5",
    summary:
      "We start with the business, not the build. One working session and a written brief later, there is a single agreed definition of the problem, the user, and done.",
    points: [
      "A working session on the opportunity, the customer, and the economics",
      "The workflow as it actually runs today, mapped honestly",
      "A written brief: problem, user, offer, scope line, explicit exclusions",
    ],
    youGet: "A brief you could hand to any competent team, including one that is not us.",
  },
  {
    index: "02",
    name: "Shape",
    duration: "Week 1–2",
    summary:
      "Scope surgery. We cut the system to the smallest version that proves the value, then design how it will actually work: screens, data, flows, integrations.",
    points: [
      "Scope cut to what earns its place; everything else parked, in writing",
      "System design: interfaces, data model, automations, approval points",
      "A fixed price and a fixed timeline, before a line of code",
    ],
    youGet: "A plan with no ambiguity about what is being built, for how much, by when.",
  },
  {
    index: "03",
    name: "Build",
    duration: "Weeks 2–6",
    summary:
      "Weekly, visible increments. You see working software every week and steer while steering is cheap. Reality gets a vote at the mid-sprint review.",
    points: [
      "Something working to see and touch every single week",
      "A Friday written update: shipped, next, blocked, decisions needed",
      "Scope changes handled with a one-paragraph memo, not a renegotiation",
    ],
    youGet: "A working system taking shape in front of you, on infrastructure you own.",
  },
  {
    index: "04",
    name: "Launch",
    duration: "Final week",
    summary:
      "QA, accessibility, performance, monitoring, then the switch is flipped with a seven-day watch window. Launches are boring here. That is the point.",
    points: [
      "Full QA pass: functional, mobile, accessibility, performance",
      "Error monitoring, analytics, and backups live before users arrive",
      "Handover documentation and a recorded walkthrough",
    ],
    youGet: "A launched system, a clean handover, and no mystery about how anything works.",
  },
  {
    index: "05",
    name: "Improve",
    duration: "Ongoing, optional",
    summary:
      "The Growth Partnership: measure what the system actually does, ship the next most valuable improvement monthly, audit quarterly. It re-earns itself or it ends.",
    points: [
      "Monthly prioritized backlog and shipped-work list",
      "Quarterly system audit across product, automation, and pipeline",
      "Monitoring and maintenance before small problems become large ones",
    ],
    youGet: "A system that compounds. And a partner who tells you when to stop paying them.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="A process you can predict, from a studio you can hold to it."
        standfirst="Five stages. Fixed prices set before work starts. Working output every week. Here is exactly what happens after you say go."
      />
      <div data-ground="bone" className="bg-bone">
        <div className="container-page section-pad">
          <ol className="relative">
            {STAGES.map((s, i) => (
              <li
                key={s.index}
                className="relative grid gap-8 border-l border-line pb-16 pl-8 last:pb-0 md:grid-cols-12 md:gap-6 md:pl-12"
              >
                <span
                  aria-hidden="true"
                  className={`absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border ${
                    i === 0 ? "border-accent bg-accent" : "border-line-strong bg-bone"
                  }`}
                />
                <div className="md:col-span-4">
                  <Reveal>
                    <p className="label text-accent">
                      {s.index} · {s.duration}
                    </p>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <h2 className="display-s mt-3 text-t1">{s.name}</h2>
                  </Reveal>
                  <Reveal delay={0.12}>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-t2">{s.summary}</p>
                  </Reveal>
                </div>
                <div className="md:col-span-7 md:col-start-6">
                  <Reveal delay={0.1}>
                    <ul className="space-y-3">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-3 text-[0.9375rem] leading-relaxed text-t2">
                          <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                  <Reveal delay={0.16}>
                    <div data-torch className="mt-6 rounded-xl border border-line bg-raised p-5">
                      <p className="label text-t3">What you walk away with</p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{s.youGet}</p>
                    </div>
                  </Reveal>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-20 text-center">
            <Reveal>
              <PrimaryLink href="/start">Start at stage one</PrimaryLink>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
