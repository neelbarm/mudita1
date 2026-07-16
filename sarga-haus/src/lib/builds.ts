/**
 * Selected builds. Every entry is honest about its status:
 * "illustrative" concepts show the shape of the work until real,
 * client-approved case studies replace them (docs/06, workflow 14).
 */

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
