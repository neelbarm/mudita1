import { allEssays } from "@/lib/essays";
import { absoluteUrl, SITE } from "@/lib/site";

export const dynamic = "force-static";

/**
 * llms.txt: a plain, honest briefing for answer engines and AI
 * assistants. Facts only; the same honesty rules as the site.
 */
export function GET(): Response {
  const essays = allEssays()
    .map((e) => `- [${e.title}](${absoluteUrl(`/journal/${e.slug}`)}): ${e.excerpt}`)
    .join("\n");

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} is a founder-led product studio for nontechnical operators:
founders, creators, consultants, coaches, agencies, and service business
owners. One accountable partner builds the product, automates the
workflow, and fills the pipeline. Flat fees, fixed scope, priced before
work starts; no hourly billing. The studio does not guarantee lead
volume or revenue, and publishes that policy.

The studio runs on its own operating system: seventeen supervised
software agents draft research, outreach, reports, and paperwork, and
every client-facing artifact is approved by a named human before it
goes anywhere. Outreach is capped at fifteen sends a day, uses verified
addresses only, and honors opt-outs permanently with one-click
unsubscribe.

Shipped work (live today): EverPage (everpage.blog), The Common
Collective (thecommoncollective.space), Styloire (styloire.co), and
Taxflow (iOS, App Store). Real work is labeled real; illustrative
examples are labeled illustrative; case studies publish only with
written client approval.

## Offers

- [Services](${absoluteUrl("/services")}): five fixed-scope offers: Validation (about two weeks), Build, Automation, Pipeline (three to six weeks each), and a monthly Growth Partnership.
- [How it works](${absoluteUrl("/how-it-works")}): the engagement process from brief to launch.
- [Selected builds](${absoluteUrl("/builds")}): shipped work and labeled illustrative systems.
- [About](${absoluteUrl("/about")}): what the studio believes and how it practices.
- [Start a project](${absoluteUrl("/start")}): the intake. Replies come from a person.

## Journal

${essays}

## Feed

- [RSS](${absoluteUrl("/feed.xml")})
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
