import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { allEssays } from "@/lib/essays";
import { absoluteUrl, ORG_JSON_LD, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Essays from a founder-led product studio on scoping MVPs, automating operations without losing judgment, and building outreach infrastructure you can be proud of.",
  alternates: {
    canonical: "/journal",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function prettyDate(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${y}`;
}

const UPCOMING = [
  "What a launch checklist is actually for",
  "The weekly report that keeps clients calm",
  "Owning your stack: why the client holds every key",
];

export default function JournalPage() {
  const essays = allEssays();
  return (
    <>
      <JsonLd
        data={{
          "@type": "Blog",
          "@id": absoluteUrl("/journal#blog"),
          name: `${SITE.name} Journal`,
          description:
            "Notes from the studio on building products, automating operations, and constructing pipelines.",
          url: absoluteUrl("/journal"),
          publisher: ORG_JSON_LD,
          blogPost: essays.map((e) => ({
            "@type": "BlogPosting",
            headline: e.title,
            datePublished: e.date,
            url: absoluteUrl(`/journal/${e.slug}`),
          })),
        }}
      />
      <PageHero
        eyebrow="Journal"
        title="Notes from the studio."
        standfirst="Essays on turning ideas into operating systems. Published when there is something worth your attention, which means: not on a schedule."
      />
      <div data-ground="bone" className="bg-bone">
        <div className="container-page section-pad">
          <div className="mx-auto max-w-2xl">
            {essays.map((e, i) => (
              <Reveal key={e.slug} delay={Math.min(i * 0.06, 0.2)}>
                <Link
                  href={`/journal/${e.slug}`}
                  data-cursor-label="Read"
                  className="group block border-t border-line py-8 transition-colors duration-300 last:border-b hover:bg-raised md:px-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <p className="label text-t3">{prettyDate(e.date)}</p>
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
                  Subscribe by feed: <a className="underline decoration-line-strong underline-offset-4 hover:text-t1" href="/feed.xml">/feed.xml</a>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
