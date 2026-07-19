import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PrimaryLink, Reveal } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, ORG_JSON_LD } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Validation Sprint, Build Sprint, Automation Sprint, Pipeline Sprint, and Growth Partnership. Flat fees, fixed scope, weekly ships.",
  alternates: { canonical: "/services" },
};

type Offer = {
  slug: string;
  index: string;
  name: string;
  lede: string;
  bestFit: string;
  outcome: string;
  process: string[];
  deliverables: string[];
  timeline: string;
  investment: string;
  notIncluded: string[];
};

const OFFERS: Offer[] = [
  {
    slug: "validation-sprint",
    index: "01",
    name: "Validation Sprint",
    lede: "A rough idea becomes a sharp, buildable plan.",
    bestFit:
      "You have an idea, a niche, or a broken workflow, and you need to know what to build, for whom, and in what order, before spending real money.",
    outcome:
      "A plan sharp enough to execute against immediately: the offer, the scope, the workflow map, and the launch sequence.",
    process: [
      "Deep working session on the opportunity, the customer, and the economics",
      "Workflow mapping: how the business actually runs today, where it breaks",
      "Scope surgery: cut to the smallest system that proves the value",
      "Written plan review, then a build decision with no obligation to build with us",
    ],
    deliverables: [
      "Positioning and offer definition",
      "Product scope document with explicit exclusions",
      "Workflow and automation map",
      "Launch and pipeline plan",
      "Build-ready brief any competent team could execute",
    ],
    timeline: "About two weeks.",
    investment:
      "Entry-level, fixed fee, credited toward a Build Sprint if we build together. Exact number in the proposal, on purpose.",
    notIncluded: [
      "Code or working software",
      "Brand identity design",
      "Market research reports for their own sake",
    ],
  },
  {
    slug: "build-sprint",
    index: "02",
    name: "Build Sprint",
    lede: "A working product, not a deck about one.",
    bestFit:
      "The scope is clear (or a Validation Sprint just made it clear) and you need an MVP, client portal, internal tool, dashboard, or workflow system that actually runs.",
    outcome:
      "Working software in front of real users, on infrastructure you own, with a clean path to what comes next.",
    process: [
      "Week zero: accounts, access, architecture, and the cut line",
      "Weekly ships: something working to see and touch every week",
      "Mid-sprint scope review: reality gets a vote",
      "QA, accessibility, and performance pass, then launch and handover",
    ],
    deliverables: [
      "The working product or system, deployed",
      "Your repository, your database, your accounts",
      "Admin access and operating documentation",
      "A recorded walkthrough",
      "A prioritized list of what to build next",
    ],
    timeline: "Three to six weeks, scope-dependent.",
    investment:
      "Mid five figures for most MVPs and systems; smaller internal tools land below that. Fixed before work begins.",
    notIncluded: [
      "Open-ended feature development",
      "Native mobile apps in a first sprint",
      "Ongoing maintenance (that is the Growth Partnership)",
    ],
  },
  {
    slug: "automation-sprint",
    index: "03",
    name: "Automation Sprint",
    lede: "The operation stops depending on your memory.",
    bestFit:
      "The business works, but it runs on you: manual follow-ups, copy-paste between tools, spreadsheets as databases, dropped balls you only hear about later.",
    outcome:
      "One governed flow for the repetitive work, with dashboards that tell the truth and human approval exactly where judgment matters.",
    process: [
      "Operations audit: every repeated motion, tool, and handoff mapped",
      "Redesign: the same operation as one flow with clear owners",
      "Implementation: integrations, CRM workflows, follow-up systems, reporting",
      "Two-week supervised run with tuning before handover",
    ],
    deliverables: [
      "Running automations across your existing tools",
      "CRM structure with stages, tasks, and follow-up logic",
      "Operator dashboard and weekly reporting",
      "AI-assisted steps where they earn their place, always with approval gates",
      "A written map of the whole system",
    ],
    timeline: "Three to five weeks.",
    investment:
      "Comparable to a small build sprint. Priced flat after the audit call.",
    notIncluded: [
      "Fully autonomous client-facing AI with no human review",
      "Tools that violate platform rules to save clicks",
      "Automating a process that should simply be deleted",
    ],
  },
  {
    slug: "pipeline-sprint",
    index: "04",
    name: "Pipeline Sprint",
    lede: "Infrastructure that puts the work in front of the right people.",
    bestFit:
      "The product or service is real and good, and new business still depends on referrals and hope.",
    outcome:
      "A lead engine you own: defined targeting, clean data, outreach machinery with human approval, and a pipeline you can read in one screen.",
    process: [
      "ICP definition: who, precisely, and what evidence qualifies them",
      "List building and enrichment from compliant sources, verified",
      "Sequence design: specific, honest outreach with human sign-off on every send",
      "CRM pipeline setup with forced next steps and weekly reporting",
    ],
    deliverables: [
      "Researched, scored target account list",
      "Enriched, verified contact data with provenance",
      "Outreach sequences and the approval workflow around them",
      "CRM pipeline stages, follow-up logic, and dashboards",
      "A weekly operating rhythm you can run without us",
    ],
    timeline: "Three to five weeks to stand up, then it runs.",
    investment:
      "Flat setup fee; ongoing operation lives in the Growth Partnership if you want us running it.",
    notIncluded: [
      "Guaranteed lead volume or meetings, from us or anyone honest",
      "Purchased spam lists or scraped data that violates platform terms",
      "Autonomous cold email without human approval",
    ],
  },
  {
    slug: "growth-partnership",
    index: "05",
    name: "Growth Partnership",
    lede: "The system keeps getting better after launch.",
    bestFit:
      "We built something together (or you have a system worth improving) and you want a partner accountable for it compounding instead of decaying.",
    outcome:
      "A system that measurably improves every month: maintained, extended, automated further, and reported on honestly.",
    process: [
      "Monthly: prioritized backlog, shipped improvements, metrics readout",
      "Quarterly: full system audit across product, automation, and pipeline",
      "Continuous: monitoring, maintenance, and small fixes before they become large ones",
    ],
    deliverables: [
      "A monthly shipped-work list you can hold us to",
      "Quarterly audit memo with recommendations",
      "Priority access for new sprints",
      "Uptime, error, and pipeline monitoring",
    ],
    timeline: "Monthly, with a quarterly re-decision. No lock-in.",
    investment:
      "A monthly retainer sized to the system under management. It has to re-earn itself every quarter.",
    notIncluded: [
      "Unlimited requests",
      "Being an outsourced everything-department",
      "Retainers that survive on inertia",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "ProfessionalService",
          "@id": absoluteUrl("/services#service"),
          name: "Sarga Haus",
          url: absoluteUrl("/services"),
          parentOrganization: ORG_JSON_LD,
          description:
            "A founder-led product studio offering fixed-scope engagements: validation, product builds, workflow automation, pipeline infrastructure, and an ongoing growth partnership.",
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Studio offers",
            itemListElement: OFFERS.map((o) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: o.name,
                description: o.lede,
              },
            })),
          },
        }}
      />
      <PageHero
        eyebrow="Services"
        title="Five ways in. One system out."
        standfirst="Every engagement is flat-fee, fixed-scope, and shipped in weekly increments. Start at the stage that matches where your business actually is."
      />
      <div data-ground="bone" className="bg-bone">
        <div className="container-page">
          {OFFERS.map((o) => (
            <article
              key={o.slug}
              id={o.slug}
              className="chapter-pad grid gap-10 border-b border-line last:border-b-0 md:grid-cols-12"
            >
              <div className="md:col-span-4">
                <Reveal>
                  <p className="font-display text-[3rem] leading-none text-t3" style={{ fontWeight: 380 }}>
                    {o.index}
                  </p>
                </Reveal>
                <Reveal delay={0.06}>
                  <h2 className="display-s mt-4 text-t1">{o.name}</h2>
                </Reveal>
                <Reveal delay={0.12}>
                  <p className="serif-italic mt-3 text-[1.15rem] text-t2">{o.lede}</p>
                </Reveal>
                <Reveal delay={0.18}>
                  <div className="mt-8 space-y-5">
                    <div>
                      <p className="label text-t3">Timeline</p>
                      <p className="mt-2 text-[0.9375rem] text-t2">{o.timeline}</p>
                    </div>
                    <div>
                      <p className="label text-t3">Investment</p>
                      <p className="mt-2 text-[0.9375rem] text-t2">{o.investment}</p>
                    </div>
                  </div>
                </Reveal>
              </div>
              <div className="space-y-8 md:col-span-7 md:col-start-6">
                <Reveal>
                  <div className="border-t border-line pt-4">
                    <p className="label text-t3">Best fit</p>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{o.bestFit}</p>
                  </div>
                </Reveal>
                <Reveal delay={0.05}>
                  <div className="border-t border-line pt-4">
                    <p className="label text-t3">Outcome</p>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{o.outcome}</p>
                  </div>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="border-t border-line pt-4">
                    <p className="label text-t3">Process</p>
                    <ol className="mt-3 space-y-2.5">
                      {o.process.map((step, i) => (
                        <li key={step} className="flex gap-3 text-[0.9375rem] leading-relaxed text-t2">
                          <span className="mt-0.5 shrink-0 text-[0.75rem] text-accent">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </Reveal>
                <Reveal delay={0.15}>
                  <div className="border-t border-line pt-4">
                    <p className="label text-t3">Deliverables</p>
                    <ul className="mt-3 space-y-2.5">
                      {o.deliverables.map((d) => (
                        <li key={d} className="flex gap-3 text-[0.9375rem] leading-relaxed text-t2">
                          <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
                <Reveal delay={0.2}>
                  <div className="border-t border-line pt-4">
                    <p className="label text-t3">Not included</p>
                    <ul className="mt-3 space-y-2.5">
                      {o.notIncluded.map((n) => (
                        <li key={n} className="flex gap-3 text-[0.9375rem] leading-relaxed text-t3">
                          <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-line-strong" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
                <Reveal delay={0.25}>
                  <PrimaryLink href="/start">Start a project</PrimaryLink>
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
