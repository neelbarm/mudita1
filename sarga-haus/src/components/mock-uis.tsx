/**
 * Illustrative interfaces, built as real DOM instead of images. These are
 * written to read as screenshots of finished products: real words, real
 * numbers, filled controls — never skeleton bars. Labeled "Illustrative
 * system" wherever they appear. No invented customers, no logos.
 */

function Chrome({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
      <span className="flex gap-1.5" aria-hidden="true">
        <i className="h-2 w-2 rounded-full bg-t3/40" />
        <i className="h-2 w-2 rounded-full bg-t3/40" />
      </span>
      <span className="ml-2 truncate text-[10px] tracking-wide text-t3">{title}</span>
      {meta ? <span className="ml-auto shrink-0 text-[9px] text-t3">{meta}</span> : null}
    </div>
  );
}

function Chip({ tone, children }: { tone: "brass" | "dim" | "ok" | "solid"; children: string }) {
  const cls =
    tone === "brass"
      ? "border border-accent/50 bg-accent/15 text-accent"
      : tone === "ok"
        ? "border border-line-strong bg-t1/10 text-t1"
        : tone === "solid"
          ? "bg-t1 text-ground font-medium"
          : "border border-line text-t3";
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] leading-relaxed tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

function Initials({ text, brass }: { text: string; brass?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold ${
        brass ? "bg-accent/25 text-accent" : "bg-t1/15 text-t1"
      }`}
    >
      {text}
    </span>
  );
}

const rowBase = "flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line last:border-b-0";

export function MvpMock() {
  const nav = ["Overview", "Sessions", "Clients", "Invoices"];
  return (
    <div className="flex h-full text-t1">
      <div className="hidden w-28 shrink-0 flex-col gap-1 border-r border-line p-3 sm:flex">
        <p className="px-2 pb-2 text-[10px] font-semibold tracking-wide">Practice OS</p>
        {nav.map((n, i) => (
          <span
            key={n}
            className={`rounded-md px-2 py-1 text-[10px] ${
              i === 1 ? "bg-t1/10 font-medium text-t1" : "text-t2"
            }`}
          >
            {n}
          </span>
        ))}
        <div className="mt-auto rounded-md bg-accent/10 px-2 py-1.5">
          <p className="text-[8px] text-accent">This week</p>
          <p className="text-[11px] font-semibold text-t1">$3,240</p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <Chrome title="sessions — today" meta="Tue 14" />
        <div className="flex items-center justify-between px-4 pb-1 pt-3">
          <span className="text-[11px] font-semibold">6 sessions</span>
          <Chip tone="brass">3 booked online</Chip>
        </div>
        {[
          ["Discovery call", "9:30 · 45 min", "Confirmed", "ok"],
          ["Strategy session", "11:00 · 90 min", "Paid $180", "brass"],
          ["Quarterly review", "14:00 · 60 min", "Reminded", "dim"],
        ].map(([name, time, st, tone]) => (
          <div key={name as string} className={rowBase}>
            <div className="flex min-w-0 items-center gap-2.5">
              <Initials text={(name as string)[0] + ((name as string).split(" ")[1]?.[0] ?? "")} />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium">{name}</p>
                <p className="text-[9px] text-t3">{time}</p>
              </div>
            </div>
            <Chip tone={tone as "ok" | "brass" | "dim"}>{st as string}</Chip>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortalMock() {
  return (
    <div className="h-full text-t1">
      <Chrome title="client portal — aurora build" meta="Sprint 3 of 4" />
      <div className="px-4 pt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold">78% delivered</span>
          <span className="text-[9px] text-t3">updated 2h ago</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-t1/10">
          <div className="h-full w-[78%] rounded-full bg-accent" />
        </div>
      </div>
      <div className="mt-3">
        {[
          ["Portal authentication", "Shipped · Mon", "ok"],
          ["Invoice view + receipts", "Shipped · Wed", "ok"],
          ["Approval flow", "In review", "brass"],
        ].map(([item, st, tone]) => (
          <div key={item as string} className={rowBase}>
            <span className="text-[11px] font-medium">{item}</span>
            <Chip tone={tone as "ok" | "brass"}>{st as string}</Chip>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 px-4 pt-3">
        <span className="rounded-full bg-t1 px-3.5 py-1.5 text-[9px] font-semibold text-ground">
          Approve sprint
        </span>
        <span className="rounded-full border border-line-strong px-3 py-1.5 text-[9px]">
          Request change
        </span>
        <span className="ml-auto text-[9px] text-t3">1 note · replied</span>
      </div>
    </div>
  );
}

export function DashboardMock() {
  const bars = [34, 52, 41, 66, 58, 74, 89];
  return (
    <div className="h-full text-t1">
      <Chrome title="operator dashboard — weekly" meta="Week 29" />
      <div className="grid grid-cols-3 gap-px border-b border-line bg-line">
        {[
          ["Open enquiries", "14", "+3 this week"],
          ["Avg response", "2.1h", "was 26h"],
          ["Hours saved", "22", "automation"],
        ].map(([k, v, d]) => (
          <div key={k} className="bg-raised px-3.5 py-3">
            <p className="text-[9px] text-t3">{k}</p>
            <p className="mt-0.5 font-display text-lg leading-none">{v}</p>
            <p className="mt-1 text-[8px] text-accent">{d}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[9px] text-t3">Qualified conversations</p>
          <p className="text-[9px] font-medium text-t1">31 this month</p>
        </div>
        <div className="mt-2 flex h-14 items-end gap-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`w-full rounded-sm ${i === bars.length - 1 ? "bg-accent" : "bg-t1/20"}`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[8px] text-t3">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
    </div>
  );
}

export function CrmMock() {
  const cols: Array<[string, number, Array<[string, string, string]>]> = [
    ["Discovery", 4, [["Workflow audit", "$8k", "TM"], ["Intro call set", "$12k", "RK"]]],
    ["Proposal", 2, [["Build sprint", "$24k", "AS"]]],
    ["Won", 3, [["Automation sprint", "$16k", "JL"]]],
  ];
  return (
    <div className="h-full text-t1">
      <Chrome title="crm — pipeline board" meta="$60k open" />
      <div className="grid h-[calc(100%-2.4rem)] grid-cols-3 gap-px bg-line">
        {cols.map(([name, count, cards]) => (
          <div key={name} className="bg-raised px-2.5 py-2.5">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-t3">{name}</p>
              <span className="rounded-full bg-t1/10 px-1.5 text-[8px] text-t2">{count}</span>
            </div>
            <div className="mt-2 space-y-2">
              {cards.map(([c, val, who]) => (
                <div key={c} className="rounded-lg border border-line bg-ground/70 p-2">
                  <p className="text-[10px] font-medium leading-snug">{c}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[9px] text-accent">{val}</span>
                    <Initials text={who} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OutboundMock() {
  return (
    <div className="h-full text-t1">
      <Chrome title="outbound console — approval queue" meta="4 awaiting" />
      {[
        ["First touch — workflow observation", "Noticed the intake form routes to a shared inbox…", "Review", true],
        ["Follow-up — teardown attached", "Sketched how the booking flow could drop two steps…", "Fri 9:00", false],
        ["Close loop — day 21", "Closing the loop on this; if timing is wrong…", "Review", true],
      ].map(([subject, preview, action, needs]) => (
        <div key={subject as string} className={rowBase}>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium">{subject}</p>
            <p className="truncate text-[9px] text-t3">{preview}</p>
          </div>
          {needs ? (
            <span className="shrink-0 rounded-full bg-t1 px-2.5 py-1 text-[9px] font-semibold text-ground">
              {action}
            </span>
          ) : (
            <span className="shrink-0 text-[9px] text-t3">{action}</span>
          )}
        </div>
      ))}
      <div className="flex items-center gap-1.5 px-4 pt-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
        <p className="text-[9px] text-t3">Nothing sends without a named approver.</p>
      </div>
    </div>
  );
}

export function AutomationRunsMock() {
  return (
    <div className="h-full text-t1">
      <Chrome title="automation — run log" meta="142 runs today" />
      {[
        ["Enquiry intake → CRM", "09:12 · 3.2s", "Completed", "ok"],
        ["Proposal follow-up", "09:04 · 1.8s", "Completed", "ok"],
        ["Weekly client report", "08:30 · draft", "Needs review", "brass"],
        ["Invoice reminder #218", "08:00 · 2.1s", "Completed", "ok"],
      ].map(([run, meta, st, tone]) => (
        <div key={run as string} className={rowBase}>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium">{run}</p>
            <p className="text-[9px] text-t3">{meta}</p>
          </div>
          <Chip tone={tone as "ok" | "brass"}>{st as string}</Chip>
        </div>
      ))}
    </div>
  );
}
