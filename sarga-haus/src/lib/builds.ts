/**
 * Selected builds.
 *
 * SHIPPED is real, completed work: named, linked, live. Lines stay short
 * and factual; fuller case studies publish only with approved detail
 * (docs/06, workflow 14).
 *
 * BUILDS below are illustrative system concepts, labeled as such, kept to
 * show the shape of deeper engagements until written case studies land.
 */

export type ShippedBuild = {
  slug: string;
  name: string;
  href: string;
  /** what the link visibly points at */
  linkLabel: string;
  category: string;
  /** Sarga Haus's role, shown when known */
  scope?: string;
  line: string;
};

export const SHIPPED: ShippedBuild[] = [
  {
    slug: "everpage",
    name: "EverPage",
    href: "https://everpage.blog/",
    linkLabel: "everpage.blog",
    category: "Web product",
    scope: "Design + build",
    line: "Designed and built end to end. Live on the open web.",
  },
  {
    slug: "the-common-collective",
    name: "The Common Collective",
    href: "https://www.thecommoncollective.space/",
    linkLabel: "thecommoncollective.space",
    category: "Community platform",
    line: "A New York membership community built around small cohorts and recurring gatherings.",
  },
  {
    slug: "styloire",
    name: "Styloire",
    href: "https://styloire.co/",
    linkLabel: "styloire.co",
    category: "Web product",
    scope: "Build",
    line: "Built end to end. Live at its own address.",
  },
  {
    slug: "taxflow",
    name: "Taxflow",
    href: "https://apps.apple.com/it/app/taxflow-keep-your-money/id6762097180?l=en-GB",
    linkLabel: "App Store",
    category: "iOS app",
    line: "Taxflow: keep your money. Live on the App Store.",
  },
];

export type Build = {
  slug: string;
  title: string;
  status: "illustrative" | "client";
  category: string;
  challenge: string;
  system: string;
  outcome: string;
  stack: string[];
  mock: "mvp" | "portal" | "dashboard" | "crm" | "outbound" | "automation";
};

export const BUILDS: Build[] = [
  {
    slug: "coaching-operating-system",
    title: "Operating system for a high-touch coaching practice",
    status: "illustrative",
    category: "Automation + Product",
    challenge:
      "A coach running twenty clients out of a calendar, three spreadsheets, and a memory. Sessions double-booked, follow-ups missed, invoices chased by hand.",
    system:
      "A single client system: booking and intake, session notes, automated follow-up sequences, invoicing with reminders, and a weekly operator dashboard. Human approval on every client-facing message.",
    outcome:
      "The shape of the result this system is designed for: administrative hours cut sharply, no silent drop-offs, and a practice that can take more clients without more chaos. Real numbers will come from real engagements, and will be published only with client approval.",
    stack: ["Next.js", "Supabase", "Stripe", "Resend", "Cal.com"],
    mock: "dashboard",
  },
  {
    slug: "creator-product-launch",
    title: "From audience to product for an independent creator",
    status: "illustrative",
    category: "Validation + Build",
    challenge:
      "A creator with a real audience and a product idea stuck at the idea stage for a year. No technical partner, no scope, no way to judge quotes from agencies.",
    system:
      "A validation sprint that cut the concept to a sellable core, then a build sprint: a working MVP with accounts, payments, and an admin panel, shipped in weekly increments.",
    outcome:
      "The intended shape: a launchable product in weeks, owned outright, with a launch checklist and a pipeline plan instead of a handover PDF.",
    stack: ["Next.js", "TypeScript", "Supabase", "Stripe"],
    mock: "mvp",
  },
  {
    slug: "agency-lead-engine",
    title: "Lead engine for a specialist consultancy",
    status: "illustrative",
    category: "Pipeline",
    challenge:
      "A consultancy whose new business depended entirely on referrals. Feast and famine, no visibility, no system between 'someone mentioned us' and a signed proposal.",
    system:
      "A compliant lead engine: defined ICP, researched account list, contact enrichment and verification, personalized sequences with human approval on every send, CRM stages with forced next steps, weekly pipeline reporting.",
    outcome:
      "The intended shape: a steady, measurable flow of qualified conversations and a pipeline the founder can read in one screen. No lead-volume promises, by design.",
    stack: ["Supabase", "Resend", "Enrichment API", "CRM"],
    mock: "outbound",
  },
];
