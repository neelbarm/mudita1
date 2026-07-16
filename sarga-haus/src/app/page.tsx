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

export default function HomePage() {
  return (
    <>
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
