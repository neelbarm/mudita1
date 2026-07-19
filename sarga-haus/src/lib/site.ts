/** Canonical site facts, used by metadata, JSON-LD, feeds, and llms.txt. */

export const SITE = {
  url: "https://sargahaus.com",
  name: "Sarga Haus",
  tagline: "Build the product. Automate the workflow. Fill the pipeline.",
  description:
    "Sarga Haus is a founder-led product studio. We turn real ideas and broken operations into products, systems, and customer pipelines built to move.",
  locale: "en_US",
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Organization node reused across every schema block. */
export const ORG_JSON_LD = {
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  slogan: SITE.tagline,
  description: SITE.description,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/icon.svg"),
  },
  knowsAbout: [
    "MVP development",
    "product development for founders",
    "business process automation",
    "workflow automation",
    "lead generation infrastructure",
    "B2B outreach systems",
    "CRM implementation",
    "internal tools",
  ],
} as const;
