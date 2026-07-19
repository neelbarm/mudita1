import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { FAQS } from "@/lib/faqs";
import { absoluteUrl } from "@/lib/site";
import { Hero } from "@/components/hero";
import { ScrollStory } from "@/components/scroll-story";
import { ServicesChapters } from "@/components/services-chapters";
import { Gallery } from "@/components/gallery";
import { OperatingSystem } from "@/components/operating-system";
import { LeadEngine } from "@/components/lead-engine";
import { AutomationToggle } from "@/components/automation-toggle";
import { Faq } from "@/components/faq";
import {
  BuildsPreview,
  FinalCta,
  FounderStatement,
  PositioningStrip,
} from "@/components/home-sections";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "FAQPage",
          "@id": absoluteUrl("/#faq"),
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <Hero />
      <PositioningStrip />
      <ScrollStory />
      <ServicesChapters />
      <Gallery />
      <OperatingSystem />
      <LeadEngine />
      <AutomationToggle />
      <BuildsPreview />
      <FounderStatement />
      <Faq />
      <FinalCta />
    </>
  );
}
