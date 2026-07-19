import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { AuditFlow } from "@/components/audit-flow";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, ORG_JSON_LD, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Operations Audit",
  description:
    "Ten questions, two minutes, an honest diagnosis: is your business an operating system or a heroic effort? Free, no signup, no tricks.",
  alternates: { canonical: "/audit" },
};

export default function AuditPage() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "WebApplication",
          "@id": absoluteUrl("/audit#tool"),
          name: "The Operations Audit",
          url: absoluteUrl("/audit"),
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description:
            "A free ten-question diagnostic that scores whether a service business runs as a system or a heroic effort, with specific findings and an honest recommendation.",
          publisher: ORG_JSON_LD,
        }}
      />
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.url },
            { "@type": "ListItem", position: 2, name: "The Operations Audit", item: absoluteUrl("/audit") },
          ],
        }}
      />
      <PageHero
        eyebrow="Free · two minutes · no signup"
        title="Is your business a system, or a heroic effort?"
        standfirst="Ten questions about how your operation actually runs: intake, booking, money, follow-up, and the disappear test. You get a scored diagnosis and an honest read, whether or not we ever speak."
      />
      <div data-ground="bone" className="bg-bone">
        <div className="container-page section-pad">
          <AuditFlow />
        </div>
      </div>
    </>
  );
}
