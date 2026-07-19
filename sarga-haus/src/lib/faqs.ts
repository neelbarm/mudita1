/** The studio FAQ: one source of truth for the on-page accordion and
 * the FAQPage structured data. Answers are written to stand alone. */

export const FAQS = [
  {
    q: "What does an engagement cost?",
    a: "Flat fees, agreed before work starts. Validation sprints sit in the low five figures or under; build, automation, and pipeline sprints range with scope; the Growth Partnership is a monthly retainer. Exact guidance per offer is on the Services page. No hourly billing, ever.",
  },
  {
    q: "Who actually does the work? Is this AI?",
    a: "Founder-led means a person scopes, decides, and answers for everything. Behind that person runs a studio operating system with seventeen supervised agents that draft research, outreach, reports, and paperwork. Draft is the key word: every client-facing artifact is approved by a named human before it goes anywhere, the agents hold no send, sign, or bill authority, and those gates are enforced in code and at the database layer, not by good intentions. You get the leverage of the machine and the judgment of a human, in that order of visibility and the reverse order of authority.",
  },
  {
    q: "How fast is a sprint?",
    a: "Validation runs about two weeks. Build, automation, and pipeline sprints typically run three to six weeks depending on scope. You see working output every week, not a report at the end.",
  },
  {
    q: "Do you take equity instead of fees?",
    a: "Rarely, and never casually. The default is flat-fee work. In selective cases where the opportunity and the operator justify it, we may propose a mixed structure. That conversation starts with us, not with a discount request.",
  },
  {
    q: "Who is this for?",
    a: "Nontechnical, ambitious operators: founders, creators, consultants, coaches, agency and service business owners. If your operation lives in spreadsheets, inboxes, and DMs and you know it should be a system, you are the person this studio was built for.",
  },
  {
    q: "Do you guarantee leads or revenue?",
    a: "No, and we put that in writing. We build pipeline infrastructure: targeting, enrichment, outreach systems with human approval, CRM motion, and honest weekly reporting. Anyone guaranteeing lead volume is selling you their optimism.",
  },
  {
    q: "What happens after launch?",
    a: "Either a clean handover with documentation and a walkthrough, or a Growth Partnership: monthly improvements, measurement, and further automation. The retainer has to re-earn itself every quarter.",
  },
  {
    q: "Who owns the code and the systems?",
    a: "You do. Everything is built on a modern, boring-in-the-good-way stack under your accounts: your repository, your database, your domains. No lock-in, no hostage infrastructure.",
  },
] as const;
