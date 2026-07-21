import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { ReadingThread } from "@/components/reading-thread";
import { Reveal } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { allEssays, essayWordCount, getEssay } from "@/lib/essays";
import { absoluteUrl, ORG_JSON_LD, SITE } from "@/lib/site";

export function generateStaticParams() {
  return allEssays().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) return {};
  const url = `/journal/${essay.slug}`;
  return {
    title: essay.title,
    description: essay.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: essay.title,
      description: essay.excerpt,
      url: absoluteUrl(url),
      siteName: SITE.name,
      type: "article",
      publishedTime: essay.date,
      locale: SITE.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: essay.title,
      description: essay.excerpt,
    },
  };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function prettyDate(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${y}`;
}

export default async function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) notFound();

  const url = absoluteUrl(`/journal/${essay.slug}`);
  const related = essay.related.map(getEssay).filter((e) => e != null);

  return (
    <>
      <JsonLd
        data={{
          "@type": "BlogPosting",
          "@id": `${url}#article`,
          headline: essay.title,
          description: essay.excerpt,
          datePublished: essay.date,
          dateModified: essay.date,
          wordCount: essayWordCount(essay),
          keywords: essay.tags.join(", "),
          url,
          mainEntityOfPage: url,
          author: ORG_JSON_LD,
          publisher: ORG_JSON_LD,
          isPartOf: { "@type": "Blog", "@id": absoluteUrl("/journal#blog") },
        }}
      />
      {essay.qa.length > 0 && (
        <JsonLd
          data={{
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            mainEntity: essay.qa.map((qa) => ({
              "@type": "Question",
              name: qa.q,
              acceptedAnswer: { "@type": "Answer", text: qa.a },
            })),
          }}
        />
      )}
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Sarga Haus", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Journal", item: absoluteUrl("/journal") },
            { "@type": "ListItem", position: 3, name: essay.title, item: url },
          ],
        }}
      />

      <ReadingThread />
      <PageHero
        eyebrow={`Journal · ${prettyDate(essay.date)} · ${essay.minutes} minute read`}
        title={`${essay.title}.`}
        standfirst={essay.standfirst}
      />
      <div data-ground="bone" className="bg-bone">
        <article className="container-page section-pad">
          <div className="mx-auto max-w-2xl">
            {essay.blocks.map((block, i) => {
              if (block.t === "h2") {
                return (
                  <Reveal key={i} as="h2" delay={0.05} className="font-display mt-12 text-[1.45rem] leading-snug text-t1 md:text-[1.7rem]">
                    <span style={{ fontWeight: 470 }}>{block.text}</span>
                  </Reveal>
                );
              }
              if (block.t === "ul") {
                return (
                  <Reveal key={i} delay={0.05}>
                    <ul className="mt-6 space-y-3">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-3 text-[1.0325rem] leading-[1.7] text-t2">
                          <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0 bg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                );
              }
              const isLede = i === 0;
              return (
                <Reveal key={i} as="p" delay={Math.min(i * 0.04, 0.16)} className={i === 0 ? "" : "mt-6"}>
                  <span
                    className={
                      isLede
                        ? "drop-cap font-display block text-[1.35rem] leading-snug text-t1 md:text-[1.55rem]"
                        : "block text-[1.0325rem] leading-[1.75] text-t2"
                    }
                  >
                    {block.text}
                  </span>
                </Reveal>
              );
            })}

            {essay.qa.length > 0 && (
              <Reveal delay={0.1}>
                <section aria-label="Questions this essay answers" className="mt-14 rounded-2xl border border-line bg-raised p-7 md:p-8">
                  <p className="label text-accent">Questions this essay answers</p>
                  <dl className="mt-5 space-y-6">
                    {essay.qa.map((qa) => (
                      <div key={qa.q}>
                        <dt className="text-[1rem] font-medium text-t1">{qa.q}</dt>
                        <dd className="mt-2 text-[0.9375rem] leading-relaxed text-t2">{qa.a}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </Reveal>
            )}

            {related.length > 0 && (
              <Reveal delay={0.1}>
                <nav aria-label="Related essays" className="mt-12 border-t border-line pt-8">
                  <p className="label text-t3">Keep reading</p>
                  <ul className="mt-4 space-y-3">
                    {related.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/journal/${r.slug}`}
                          className="group inline-flex items-baseline gap-2 font-display text-[1.15rem] text-t1 transition-colors hover:text-accent"
                        >
                          {r.title}
                          <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" className="translate-y-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Reveal>
            )}

            <Reveal delay={0.15}>
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <Link
                  href="/journal"
                  className="inline-flex items-center gap-2 text-[0.875rem] text-t2 transition-colors hover:text-t1"
                >
                  <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
                  Back to the journal
                </Link>
                <Link
                  href="/start"
                  className="inline-flex items-center gap-1.5 text-[0.875rem] text-t1 underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  Bring the studio a real problem
                </Link>
              </div>
            </Reveal>
          </div>
        </article>
      </div>
    </>
  );
}
