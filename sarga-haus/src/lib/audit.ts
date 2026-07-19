/**
 * The Operations Audit: ten questions, honest scoring, a diagnosis in
 * the house voice. Pure data and logic; the flow component renders it.
 * Score per answer: 2 = a system, 1 = half a system, 0 = heroics.
 */

export interface AuditOption {
  label: string;
  score: 0 | 1 | 2;
  /** Shown in the diagnosis when this answer is picked (0 and 1 only). */
  finding?: string;
}

export interface AuditQuestion {
  id: string;
  area: string;
  q: string;
  options: AuditOption[];
}

export const AUDIT: AuditQuestion[] = [
  {
    id: "intake",
    area: "Intake",
    q: "A new enquiry arrives. What happens?",
    options: [
      { label: "A form captures it, it lands in one place, and a reply goes out the same day", score: 2 },
      { label: "It lands in my inbox or DMs and I answer when I can", score: 1, finding: "Enquiries live in an inbox, so response time depends on your attention instead of a system." },
      { label: "It could arrive in any of five places and sometimes slips through", score: 0, finding: "Enquiries have no single front door; some are being lost before anyone sees them." },
    ],
  },
  {
    id: "booking",
    area: "Scheduling",
    q: "How do people book time or services with you?",
    options: [
      { label: "Self-serve: they pick, pay if needed, and it lands on the calendar", score: 2 },
      { label: "A scheduling link, but confirmations and changes still need me", score: 1, finding: "Booking is half-automated: the calendar fills itself but the exceptions all route to you." },
      { label: "Back-and-forth messages until a time is agreed", score: 0, finding: "Every booking costs a conversation. The thread is the system, and the thread does not scale." },
    ],
  },
  {
    id: "payments",
    area: "Money in",
    q: "How does money actually get collected?",
    options: [
      { label: "Invoices or checkout go out on a system, reminders happen without me", score: 2 },
      { label: "I send invoices myself and chase them when I remember", score: 1, finding: "Collections run on your memory. Late invoices age quietly until they hurt." },
      { label: "Payment happens ad hoc: transfers, apps, cash, whatever works that day", score: 0, finding: "There is no ledger a system could even chase. Revenue leaks are invisible by design." },
    ],
  },
  {
    id: "followup",
    area: "Follow-up",
    q: "A prospect says \"sounds interesting\" and goes quiet. What happens next?",
    options: [
      { label: "A scheduled follow-up exists the moment the conversation stalls", score: 2 },
      { label: "I follow up when they cross my mind", score: 1, finding: "Follow-up depends on remembering. Deals are dying of politeness in the background." },
      { label: "Usually nothing. If they were serious they would come back", score: 0, finding: "No follow-up system means the pipeline is whoever shouted most recently." },
    ],
  },
  {
    id: "disappear",
    area: "The disappear test",
    q: "You vanish for two weeks. What survives?",
    options: [
      { label: "Bookings, payments, and follow-ups keep running; delivery pauses gracefully", score: 2 },
      { label: "Existing clients are fine but everything new stops dead", score: 1, finding: "The operation runs on rails but growth is single-threaded through you." },
      { label: "Honestly, most of it stops", score: 0, finding: "The business fails the disappear test. It is not an asset yet; it is a job with your name on it." },
    ],
  },
  {
    id: "numbers",
    area: "Reporting",
    q: "How do you know how the business did this week?",
    options: [
      { label: "A report or dashboard tells me without being asked", score: 2 },
      { label: "I can assemble the picture from a few tools when I need to", score: 1, finding: "The numbers exist but require an expedition. Measured rarely means managed rarely." },
      { label: "By feel", score: 0, finding: "No weekly numbers means decisions run on mood. Good weeks and bad weeks feel identical until the bank balance disagrees." },
    ],
  },
  {
    id: "tools",
    area: "Tools",
    q: "How do your tools relate to each other?",
    options: [
      { label: "A few tools, connected: data entered once shows up everywhere it should", score: 2 },
      { label: "Good tools, but I am the integration: copying between them by hand", score: 1, finding: "You are employed part-time as middleware between your own tools." },
      { label: "A drawer of subscriptions that do not talk to each other", score: 0, finding: "Tool sprawl without connection: each app is a silo and the truth lives nowhere." },
    ],
  },
  {
    id: "pipeline",
    area: "New business",
    q: "Where does next month's revenue come from?",
    options: [
      { label: "A pipeline with stages, next steps, and a weekly rhythm", score: 2 },
      { label: "Referrals and luck, which have been generous so far", score: 1, finding: "Revenue depends on referral weather. Great until the season changes." },
      { label: "I genuinely do not know", score: 0, finding: "No pipeline visibility. The scariest number in the business is the one nobody can see." },
    ],
  },
  {
    id: "repetition",
    area: "Repetitive work",
    q: "How much of your week is the same five tasks on repeat?",
    options: [
      { label: "Very little: the repetitive motion runs itself and I do judgment work", score: 2 },
      { label: "A few hours a week I know I should not be spending", score: 1, finding: "Hours a week of repeatable motion: the clearest automation candidate in the whole audit." },
      { label: "Most of it. I am the machine", score: 0, finding: "The operator is doing machine work at operator prices. The craft is being starved to feed the admin." },
    ],
  },
  {
    id: "judgment",
    area: "Attention",
    q: "The decisions only you can make: how do they reach you?",
    options: [
      { label: "Prepared and queued: I decide in minutes, everything else runs", score: 2 },
      { label: "Mixed into everything else: important calls buried in noise", score: 1, finding: "Judgment competes with noise for your attention. The expensive decisions wait behind the cheap ones." },
      { label: "Everything reaches me, which is the problem", score: 0, finding: "No filter between you and the operation: every small thing costs the attention the big things need." },
    ],
  },
];

export const MAX_SCORE = AUDIT.length * 2;

export interface Verdict {
  name: string;
  range: [number, number];
  read: string;
  offer: { name: string; why: string };
}

export const VERDICTS: Verdict[] = [
  {
    name: "A heroic effort",
    range: [0, 8],
    read: "The business runs because you personally hold it together, every day, by hand. That is not a character flaw; it is a stage. But heroics do not compound, and they do not survive a holiday. The next move is not a bigger tool or more discipline. It is taking the two or three heaviest manual loops and making them run themselves.",
    offer: { name: "Automation Sprint", why: "Take the heaviest manual workflows and turn them into systems with judgment kept in the loop." },
  },
  {
    name: "Half a machine",
    range: [9, 14],
    read: "Parts of the operation run themselves; the rest runs on your memory and evenings. This is the most common stage and the most deceptive, because it works right up until you grow. The gaps this audit found are specific and fixable, and fixing them is usually weeks of work, not months.",
    offer: { name: "Automation Sprint", why: "Close the specific gaps: connect the tools, systemize follow-up, and make the numbers report themselves." },
  },
  {
    name: "An operating system",
    range: [15, 20],
    read: "The operation largely runs itself, which puts you in a small minority. The leverage now is demand and compounding: pointing this machine at a fuller pipeline, and improving it on a monthly rhythm instead of when things break.",
    offer: { name: "Pipeline Sprint", why: "A machine this sound deserves a fuller pipeline: targeting, enrichment, and human-approved outreach." },
  },
];

export function verdictFor(score: number): Verdict {
  return VERDICTS.find((v) => score >= v.range[0] && score <= v.range[1]) ?? VERDICTS[VERDICTS.length - 1]!;
}

export function categoryFor(answers: number[]): string {
  const pipelineIdx = AUDIT.findIndex((q) => q.id === "pipeline");
  const score = answers.reduce((s, a) => s + a, 0);
  if (score >= 15 && (answers[pipelineIdx] ?? 2) < 2) return "pipeline";
  return "automation";
}
