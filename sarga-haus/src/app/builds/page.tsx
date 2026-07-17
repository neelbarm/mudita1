import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PrimaryLink, Reveal } from "@/components/ui";
import { ShippedLedger } from "@/components/shipped-ledger";
import { BUILDS } from "@/lib/builds";
import {
  AutomationRunsMock,
  CrmMock,
  DashboardMock,
  MvpMock,
  OutboundMock,
  PortalMock,
} from "@/components/mock-uis";

export const metadata: Metadata = {
  title: "Selected builds",
  description:
    "Shipped work from Sarga Haus: EverPage, The Common Collective, Styloire, and Taxflow. Real work is labeled real. Illustrative work is labeled illustrative.",
};

const MOCKS = {
  mvp: MvpMock,
  portal: PortalMock,
  dashboard: DashboardMock,
  crm: CrmMock,
  outbound: OutboundMock,
  automation: AutomationRunsMock,
} as const;

export default function BuildsPage() {
  return (
    <>
      <PageHero
        eyebrow="Selected builds"
        title="The work, without the theater."
        standfirst="A rule this studio will not break: real work is labeled real, illustrative work is labeled illustrative, and detailed case studies publish only with approval. The shipped work below speaks from its own address."
      />
      <div data-ground="ink" className="bg-ink">
        <div className="container-page pb-8">
          <Reveal>
            <p className="label text-accent">Shipped</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-m mt-5 max-w-2xl text-t1">
              Built here. Live now.
            </h2>
          </Reveal>
          <div className="mt-10">
            <ShippedLedger variant="page" />
          </div>
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-xl text-[0.875rem] leading-relaxed text-t3">
              Written case studies for these builds are in progress and will
              publish with approved detail. Until then, each one is judged the
              only way that matters: by using it.
            </p>
          </Reveal>
        </div>

        <div className="container-page section-pad space-y-24">
          <div className="border-t border-line pt-16">
            <Reveal>
              <p className="label text-accent">Illustrative systems</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display-m mt-5 max-w-2xl text-t1">
                The shape of deeper engagements.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="standfirst mt-5 max-w-2xl text-t2">
                Three worked examples of how a full engagement runs, labeled
                for what they are: illustrative, until the written case
                studies above replace them.
              </p>
            </Reveal>
          </div>
          {BUILDS.map((b, i) => {
            const Mock = MOCKS[b.mock];
            return (
              <article
                key={b.slug}
                id={b.slug}
                className="grid gap-10 border-t border-line pt-16 md:grid-cols-12"
              >
                <div className="md:col-span-5">
                  <Reveal>
                    <div className="flex items-center gap-4">
                      <span className="label text-accent">{b.category}</span>
                      <span className="label rounded-full border border-line px-2.5 py-1 text-t3">
                        {b.status === "client" ? "Client work" : "Illustrative system"}
                      </span>
                    </div>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <h2 className="display-s mt-5 text-t1">{b.title}</h2>
                  </Reveal>
                  <Reveal delay={0.12}>
                    <div data-torch className="mt-8 h-72 overflow-hidden rounded-2xl border border-line bg-raised">
                      <Mock />
                    </div>
                  </Reveal>
                  <Reveal delay={0.18}>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {b.stack.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-line px-3 py-1 text-[0.75rem] text-t2"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                </div>
                <div className="space-y-8 md:col-span-6 md:col-start-7">
                  <Reveal delay={0.08}>
                    <div className="border-t border-line pt-4">
                      <p className="label text-t3">The challenge</p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{b.challenge}</p>
                    </div>
                  </Reveal>
                  <Reveal delay={0.14}>
                    <div className="border-t border-line pt-4">
                      <p className="label text-t3">The system built</p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{b.system}</p>
                    </div>
                  </Reveal>
                  <Reveal delay={0.2}>
                    <div className="border-t border-line pt-4">
                      <p className="label text-t3">The outcome</p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{b.outcome}</p>
                    </div>
                  </Reveal>
                  {i === 0 && (
                    <Reveal delay={0.26}>
                      <div data-torch className="rounded-xl border border-line bg-raised p-5">
                        <p className="label text-t3">A note on proof</p>
                        <p className="mt-2 text-[0.875rem] leading-relaxed text-t2">
                          Case studies on this page will carry verified detail,
                          quotes approved in writing, and real screens. No
                          invented logos, no borrowed numbers.
                        </p>
                      </div>
                    </Reveal>
                  )}
                </div>
              </article>
            );
          })}
          <div className="border-t border-line pt-16 text-center">
            <Reveal>
              <h2 className="display-m text-t1">Yours belongs on this list.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="standfirst mx-auto mt-5 max-w-xl text-t2">
                Every build above started the same way: a real idea and a
                short brief. Bring the next one.
              </p>
            </Reveal>
            <Reveal delay={0.2} className="mt-9">
              <PrimaryLink href="/start">Start a project</PrimaryLink>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
