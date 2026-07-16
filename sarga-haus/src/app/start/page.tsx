import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { IntakeForm } from "@/components/intake-form";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Bring the idea, the bottleneck, or the broken workflow. Four short steps, read by a person, answered within a business day.",
};

export default function StartPage() {
  return (
    <>
      <PageHero
        eyebrow="Start a project"
        title="Bring something real."
        standfirst="Four short steps. No discovery-call gauntlet, no forms that feel like visa applications. A person reads every brief and replies either way."
      />
      <div data-ground="ink" className="bg-ink">
        <div className="container-page pb-32 pt-4 md:pb-40">
          <IntakeForm />
        </div>
      </div>
    </>
  );
}
