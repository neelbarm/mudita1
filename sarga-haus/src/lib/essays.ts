/**
 * The journal's content system. Essays are typed data so every surface
 * (pages, feed, sitemap, JSON-LD, OG images, llms.txt) renders from one
 * source of truth. House rules apply: plain voice, no em dashes, no
 * invented metrics, no fake clients. Worked examples are hypothetical
 * patterns, never named client claims.
 */

export type EssayBlock =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "ul"; items: string[] };

export interface EssayQA {
  q: string;
  a: string;
}

export interface Essay {
  slug: string;
  title: string;
  standfirst: string;
  /** ISO date of publication. */
  date: string;
  minutes: number;
  excerpt: string;
  tags: string[];
  blocks: EssayBlock[];
  /** Questions this essay answers, rendered on page and in FAQ schema. */
  qa: EssayQA[];
  related: string[];
}

export const ESSAYS: Essay[] = [
  {
    slug: "why-most-mvps-are-scoped-backwards",
    title: "Why most MVPs are scoped backwards",
    standfirst:
      "Founders scope MVPs by asking what they can cut. The better question is what they must learn. Scope from the riskiest assumption backward and the build gets smaller, faster, and far more honest.",
    date: "2026-07-19",
    minutes: 5,
    excerpt:
      "Feature lists shrink an idea without de-risking it. Scope from the riskiest assumption backward instead: find the one thing that must be true, then build the shortest path that tests it with real money and real users.",
    tags: ["mvp", "product", "validation"],
    blocks: [
      {
        t: "p",
        text: "Ask a founder to scope an MVP and you will usually watch the same ritual: write down every feature the finished product should have, then cross things out until the budget stops hurting. The result is a smaller version of the imagined product. It is almost never the fastest test of the idea.",
      },
      {
        t: "p",
        text: "That is scoping backwards. It starts from the destination and subtracts. The features that survive are the ones the founder is most attached to, which are rarely the ones the business depends on. Attachment is not risk.",
      },
      { t: "h2", text: "Start from the assumption that kills you" },
      {
        t: "p",
        text: "Every idea carries one assumption that, if wrong, makes the rest irrelevant. A booking product assumes people will book without a conversation. A marketplace assumes supply shows up before demand pays. A coaching platform assumes clients want the coach's method without the coach in the room. Name that assumption first, in one sentence, before any feature exists.",
      },
      {
        t: "p",
        text: "Then scope forward: what is the shortest path a real user can walk that proves or breaks the assumption? Not a survey, not a mockup walkthrough. A path where someone gives you the thing that is expensive for them: money, hours, or their own customers' attention.",
      },
      { t: "h2", text: "The money path is the skeleton" },
      {
        t: "p",
        text: "For most service and product businesses the walking skeleton is the money path: discover, decide, pay, receive. Everything on that path gets built properly. Everything off it gets faked, deferred, or done by hand behind the curtain. Admin panels, settings pages, notification preferences, role systems: all of it can wait while the one path that proves the business gets real.",
      },
      {
        t: "ul",
        items: [
          "On the path: the page that sells, the flow that takes payment, the delivery that keeps the promise.",
          "Off the path: dashboards, profiles, integrations you might need, anything with the word manage in it.",
          "Done by hand for now: onboarding, support, edge cases. A founder doing something manually is not a failure of the MVP. It is the MVP.",
        ],
      },
      { t: "h2", text: "Two weeks of thinking is cheaper than two months of building" },
      {
        t: "p",
        text: "This is why validation runs before build at this studio. A validation sprint exists to find the killing assumption and design the shortest test of it, on paper, where changing your mind costs nothing. Projects that skip this step do not skip the work. They do it later, in code, at ten times the price.",
      },
      {
        t: "p",
        text: "The honest output of scoping forward is sometimes uncomfortable: the MVP that tests your idea might be a concierge service, a waitlist with a deposit, or a spreadsheet with a payment link. Build that version first anyway. Software earns its complexity by surviving contact with paying users.",
      },
      {
        t: "p",
        text: "A scope is not a list of what you could not afford. It is a bet, written down. Scope backwards and you bet on features. Scope forward and you bet on learning. Only one of those pays compound interest.",
      },
    ],
    qa: [
      {
        q: "How should I scope an MVP?",
        a: "Name the single assumption that kills the idea if it is wrong, then build the shortest path a real user can walk that tests it with real commitment: money, hours, or attention. Build the money path properly and do everything else by hand until the idea earns more software.",
      },
      {
        q: "What should not be in an MVP?",
        a: "Anything off the money path: admin panels, settings, role systems, dashboards, and integrations you might need later. If a founder can do it manually behind the scenes for the first hundred users, it does not belong in the first build.",
      },
      {
        q: "How long should an MVP take to build?",
        a: "With the scope pointed at one assumption, most MVPs are a three to six week build after a roughly two week validation sprint. If the plan says six months, the scope is a product roadmap wearing an MVP costume.",
      },
    ],
    related: ["the-approval-point", "the-dm-is-a-queue-with-no-exit"],
  },
  {
    slug: "the-approval-point",
    title: "The approval point: where automation should stop",
    standfirst:
      "The question is not what can be automated. Nearly everything can. The question is where judgment must survive, and the answer is a design primitive we call the approval point.",
    date: "2026-07-19",
    minutes: 5,
    excerpt:
      "Automate the motion, keep the judgment. An approval point is a deliberate stop where a named human decides before anything irreversible happens: money leaves, a promise is made, a message carries your name.",
    tags: ["automation", "ai", "operations"],
    blocks: [
      {
        t: "p",
        text: "Every automation pitch eventually arrives at the same fantasy: the business that runs itself. Enquiries answered, leads contacted, invoices chased, reports written, all while the owner sleeps. The fantasy fails not because the technology is weak but because it removes the one ingredient customers were actually buying: someone who gives a damn, exercising judgment.",
      },
      {
        t: "p",
        text: "The useful question is never whether a task can be automated. Nearly everything can. The useful question is which decisions must remain human for the business to stay trustworthy, and how to make those decisions take seconds instead of hours.",
      },
      { t: "h2", text: "The approval point, defined" },
      {
        t: "p",
        text: "An approval point is a deliberate stop in an automated flow where a named person decides before the flow continues. Not a notification. Not a log entry someone might read. A gate: the machine prepares everything, presents it for judgment, and does nothing further until a human clears it.",
      },
      {
        t: "p",
        text: "Three kinds of moments earn one. When money moves: invoices, refunds, purchases. When a promise is made: quotes, delivery dates, scope. When your name is on it: anything a customer or prospect will read as you speaking. Everything else, the copying, the routing, the reminding, the formatting, the summarizing, is motion, and motion is what machines are for.",
      },
      { t: "h2", text: "We run our own studio this way" },
      {
        t: "p",
        text: "This is not theory we sell and skip. Sarga Haus runs on seventeen software agents that draft research, outreach, reports, proposals, and paperwork. Not one of them can send, sign, or bill. Every client-facing artifact stops at an approval queue where a named human clears it, and the gates are enforced in the code and at the database layer, not by a policy document. The machine does the motion. The judgment stays expensive, because judgment is the product.",
      },
      { t: "h2", text: "Designing a good gate" },
      {
        t: "ul",
        items: [
          "The machine arrives prepared: the draft written, the context attached, the recommendation stated. A gate that makes the human do the work is just a task with extra steps.",
          "Deciding takes seconds: approve, edit then approve, or reject with a reason. All three recorded.",
          "The gate cannot be bypassed by enthusiasm: enforce it in the system, not in the training doc.",
          "Volume respects the human: a queue of three hundred approvals is not oversight, it is theater. Automate less or filter harder.",
        ],
      },
      {
        t: "p",
        text: "The payoff of placing gates well is not just safety. It is speed with a clean conscience. When every outbound message, invoice, and promise passes a human in seconds, you can let the machine run hard everywhere else without wondering what it is doing in your name.",
      },
      {
        t: "p",
        text: "Full automation is a claim about your business: that nothing in it deserves judgment. Customers can tell when that claim is true. Keep the approval points, and automation stops being a risk to your reputation and starts compounding it.",
      },
    ],
    qa: [
      {
        q: "What should a small business automate first?",
        a: "Automate motion that carries no judgment: intake routing, reminders, data entry between tools, report assembly, and follow-up scheduling. Keep human approval on anything where money moves, a promise is made, or a customer reads the words as yours.",
      },
      {
        q: "Should AI send emails to customers automatically?",
        a: "No. AI should draft; a named human should approve every message that carries your name. The draft-then-approve pattern keeps the speed of automation while keeping trust, and it takes seconds per message when the system prepares everything for the decision.",
      },
      {
        q: "What is human-in-the-loop automation?",
        a: "A design where automated flows stop at defined gates for a human decision before anything irreversible happens. The machine prepares the work and waits; the human approves, edits, or rejects; the decision is recorded and only then does the flow continue.",
      },
    ],
    related: ["pipeline-infrastructure-for-people-who-hate-outreach", "the-dm-is-a-queue-with-no-exit"],
  },
  {
    slug: "pipeline-infrastructure-for-people-who-hate-outreach",
    title: "Pipeline infrastructure for people who hate outreach",
    standfirst:
      "Most operators who say they hate outreach actually hate spam, and they are right to. The alternative is not volume. It is infrastructure: a small, compliant machine that earns attention fifteen sends at a time.",
    date: "2026-07-19",
    minutes: 6,
    excerpt:
      "You do not need a thousand cold emails. You need signals, a defined list, verified contacts, honest qualification, and a small number of human-approved messages so specific they could not have been sent to anyone else.",
    tags: ["pipeline", "outreach", "sales"],
    blocks: [
      {
        t: "p",
        text: "Consultants, agencies, and service founders tell us the same thing in almost the same words: I hate outreach. Push on it and the hatred is specific. They hate the idea of being the spam they delete every morning. They hate sequences that lie about following up. They hate the volume game, because they can feel what it does to the sender's soul and the receiver's inbox.",
      },
      {
        t: "p",
        text: "Good instinct. The volume game is also simply wrong for a services business. You do not need four hundred replies a month. You need three good conversations a week with people whose problem you can actually solve. That is not a volume problem. It is an infrastructure problem.",
      },
      { t: "h2", text: "Infrastructure, not heroics" },
      {
        t: "p",
        text: "Pipeline infrastructure is the machinery that makes a small number of excellent touches repeatable: signals, targeting, enrichment, qualification, and sequenced follow-up, each as a system instead of a burst of willpower. Built once, it runs on process. Without it, outreach is a mood, and moods do not compound.",
      },
      {
        t: "ul",
        items: [
          "Signals: evidence a business has the problem you solve, from their own public pages. Hiring posts, manual booking language, tool churn. Signals replace guessing with reading.",
          "Targeting: a written definition of who you serve, narrow enough that the wrong buyer is excluded on paper before anyone writes a word.",
          "Enrichment: verified contact data from licensed sources, with the provenance of every field recorded. Bad data is how good intentions become spam.",
          "Qualification: a scoring rubric that filters most prospects out on purpose. Attention is the scarce asset; the rubric protects it.",
          "Sequenced touches: a small number of messages over weeks, each earning the next, ending with a clean close instead of a guilt trip.",
        ],
      },
      { t: "h2", text: "Fifteen a day beats fifteen hundred" },
      {
        t: "p",
        text: "Our own machine enforces a ceiling of fifteen outbound sends a day, and every one of them requires a named human's approval before it leaves. That is not a limitation we tolerate. It is the strategy. A message that opens with a specific observation about how a business actually operates, and offers one idea worth stealing whether or not they ever reply, cannot be produced fifteen hundred times a day. At fifteen a day it can be produced every day, forever, without shame.",
      },
      {
        t: "p",
        text: "Compliance follows from the same posture instead of fighting it. Verified addresses only, a working one-click unsubscribe in every footer, opt-outs honored permanently, quiet hours respected. None of that hurts a low-volume, high-specificity machine. It only hurts spam.",
      },
      { t: "h2", text: "What the first month looks like" },
      {
        t: "p",
        text: "Write the targeting definition. Build the signal sources and the scoring rubric. Enrich and verify one small list. Draft sequences in your own voice with an approval gate in front of the send button. Then run the daily loop: the machine drafts, you approve in minutes, replies get a human answer the same day. Measure conversations, not opens.",
      },
      {
        t: "p",
        text: "Outreach you would be proud to receive is not a paradox. It is a system requirement. Build the infrastructure and the part everyone hates, the spray, the pray, the fake follow-ups, simply never gets built.",
      },
    ],
    qa: [
      {
        q: "How can a consultant get clients without spamming?",
        a: "Build small outreach infrastructure instead of chasing volume: define the target narrowly, collect public signals that a business has your problem, verify contacts through licensed data, score and filter hard, then send a few highly specific human-approved messages a day with honest follow-up and a clean close.",
      },
      {
        q: "How many cold emails should a service business send per day?",
        a: "Far fewer than the volume tools suggest. A services business needs conversations, not opens; something in the range of ten to twenty deeply specific sends a day, every day, sustainably outperforms burst campaigns and keeps deliverability and reputation intact.",
      },
      {
        q: "What is pipeline infrastructure?",
        a: "The machinery that makes excellent outreach repeatable: signal collection, a written targeting definition, licensed enrichment and verification, a qualification rubric that filters most prospects out, sequenced human-approved touches, and CRM stages with next steps and weekly reporting.",
      },
    ],
    related: ["the-approval-point", "why-most-mvps-are-scoped-backwards"],
  },
  {
    slug: "the-dm-is-a-queue-with-no-exit",
    title: "The DM is a queue with no exit",
    standfirst:
      "On what it really costs when the booking system is a message thread, and what a system shaped like the operation looks like instead.",
    date: "2026-07-18",
    minutes: 3,
    excerpt:
      "When bookings live in a message thread, the thread becomes the system: intake, calendar, payments, and waitlist held together by one person's attention.",
    tags: ["operations", "automation", "service-business"],
    blocks: [
      { t: "p", text: "Every service business has a system. The question is whether anyone designed it." },
      {
        t: "p",
        text: "When a studio takes bookings over Instagram DMs, the DM thread becomes the system: intake form, calendar, payment reminder, and waitlist, all at once, all held together by one person's attention. It works, in the way a kitchen drawer works. Everything is in there. Nothing can be found twice the same way.",
      },
      {
        t: "p",
        text: "The cost hides in the switching. Two hours a day of message triage is not two hours of work; it is two hundred small decisions that each pull attention away from the actual craft. The operator feels busy because they are busy. The business feels stuck because the busyness produces no compounding structure.",
      },
      {
        t: "p",
        text: "Here is the test: if you disappeared for a week, would bookings still happen? If the answer is no, the DMs are not a channel. They are a single point of failure wearing a friendly interface.",
      },
      {
        t: "p",
        text: "The fix is rarely a bigger tool. Studio suites fail here precisely because they replace a personal system with an institutional one. The fix is a small system shaped like the operation: a schedule that books itself, a waitlist that fills its own gaps, and a morning summary that turns two hours of triage into two minutes of reading.",
      },
      {
        t: "p",
        text: "A system is not the opposite of the personal touch. It is what protects the time the personal touch comes from.",
      },
    ],
    qa: [
      {
        q: "Should a small business take bookings by DM?",
        a: "DMs are a fine front door and a terrible system of record. Keep the DM as the place people say hello, and route the actual booking to a schedule that takes payment and manages its own waitlist, so no sale depends on one person reading messages fast enough.",
      },
      {
        q: "How much time does manual booking really cost?",
        a: "The visible cost is the daily triage time; the real cost is the switching. Hundreds of small decisions a day drain the attention the craft runs on, and manual threads leak revenue whenever a freed spot dies in an unanswered conversation.",
      },
    ],
    related: ["the-approval-point", "why-most-mvps-are-scoped-backwards"],
  },
];

export function getEssay(slug: string): Essay | undefined {
  return ESSAYS.find((e) => e.slug === slug);
}

/** Newest first. */
export function allEssays(): Essay[] {
  return [...ESSAYS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function essayWordCount(e: Essay): number {
  const text = e.blocks
    .map((b) => (b.t === "ul" ? b.items.join(" ") : b.text))
    .join(" ");
  return text.split(/\s+/).length;
}
