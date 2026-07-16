/**
 * Illustrative interfaces, built as real DOM instead of images: zero network
 * weight, crisp at any density, and honest about what they are. Every card
 * carries an "Illustrative system" label. No invented customers, no logos.
 */

function Chrome({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
      <span className="flex gap-1.5" aria-hidden="true">
        <i className="h-2 w-2 rounded-full border border-line-strong" />
        <i className="h-2 w-2 rounded-full border border-line-strong" />
      </span>
      <span className="ml-2 text-[10px] tracking-wide text-t3">{title}</span>
    </div>
  );
}

function StatusChip({ tone, children }: { tone: "brass" | "dim" | "ok"; children: string }) {
  const cls =
    tone === "brass"
      ? "border-accent/60 text-accent"
      : tone === "ok"
        ? "border-line-strong text-t2"
        : "border-line text-t3";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] leading-relaxed tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

const rowBase = "flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line last:border-b-0";

export function MvpMock() {
  return (
    <div className="flex h-full text-t1">
      <div className="hidden w-28 shrink-0 flex-col gap-3 border-r border-line p-4 sm:flex">
        <span className="h-2 w-10 rounded bg-t1/80" />
        <span className="mt-3 h-1.5 w-16 rounded bg-t3/50" />
        <span className="h-1.5 w-12 rounded bg-t3/50" />
        <span className="h-1.5 w-14 rounded bg-accent/70" />
        <span className="h-1.5 w-10 rounded bg-t3/50" />
      </div>
      <div className="min-w-0 flex-1">
        <Chrome title="sessions — founder mvp" />
        <div className="flex items-center justify-between px-4 pb-1 pt-3">
          <span className="text-[11px] font-medium">Today</span>
          <span className="rounded-full border border-accent/60 px-2 py-0.5 text-[9px] text-accent">
            New booking
          </span>
        </div>
        {[
          ["Discovery call", "9:30", "Confirmed"],
          ["Strategy session", "11:00", "Paid"],
          ["Follow-up review", "14:00", "Pending"],
        ].map(([name, time, st]) => (
          <div key={name} className={rowBase}>
            <div className="min-w-0">
              <p className="truncate text-[11px]">{name}</p>
              <p className="text-[9px] text-t3">{time} · 45 min</p>
            </div>
            <StatusChip tone={st === "Pending" ? "dim" : "ok"}>{st}</StatusChip>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortalMock() {
  return (
    <div className="h-full text-t1">
      <Chrome title="client portal — build progress" />
      <div className="px-4 pt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium">Sprint 3 of 4</span>
          <span className="text-[9px] text-t3">updated today</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded bg-t1/10">
          <div className="h-full w-3/4 rounded bg-accent/80" />
        </div>
      </div>
      <div className="mt-3">
        {[
          ["Portal authentication", "Shipped"],
          ["Invoice view", "Shipped"],
          ["Approval flow", "In review"],
        ].map(([item, st]) => (
          <div key={item} className={rowBase}>
            <span className="text-[11px]">{item}</span>
            <StatusChip tone={st === "In review" ? "brass" : "ok"}>{st}</StatusChip>
          </div>
        ))}
      </div>
      <div className="flex gap-2 px-4 pt-3">
        <span className="rounded-full bg-t1 px-3 py-1 text-[9px] font-medium text-ground">Approve</span>
        <span className="rounded-full border border-line-strong px-3 py-1 text-[9px]">Request change</span>
      </div>
    </div>
  );
}

export function DashboardMock() {
  return (
    <div className="h-full text-t1">
      <Chrome title="operator dashboard — weekly" />
      <div className="grid grid-cols-3 gap-px border-b border-line">
        {[
          ["Open enquiries", "14"],
          ["Awaiting reply", "3"],
          ["Hours saved", "22"],
        ].map(([k, v]) => (
          <div key={k} className="px-4 py-3">
            <p className="text-[9px] text-t3">{k}</p>
            <p className="mt-1 font-display text-lg leading-none">{v}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-3">
        <p className="text-[9px] text-t3">Pipeline activity</p>
        <svg viewBox="0 0 240 48" className="mt-2 h-12 w-full" fill="none" aria-hidden="true">
          <path
            d="M0 40 L30 36 L60 38 L90 28 L120 30 L150 20 L180 22 L210 12 L240 14"
            stroke="var(--accent)"
            strokeWidth="1.4"
          />
          <path d="M0 46 H240" stroke="var(--color-line)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

export function CrmMock() {
  const cols: Array<[string, string[]]> = [
    ["Discovery", ["Workflow audit", "Intro call set"]],
    ["Proposal", ["Build sprint scoped"]],
    ["Won", ["Automation sprint"]],
  ];
  return (
    <div className="h-full text-t1">
      <Chrome title="crm — pipeline board" />
      <div className="grid h-[calc(100%-2.4rem)] grid-cols-3 gap-px">
        {cols.map(([name, cards]) => (
          <div key={name} className="border-r border-line px-3 py-3 last:border-r-0">
            <p className="text-[9px] uppercase tracking-[0.12em] text-t3">{name}</p>
            <div className="mt-2 space-y-2">
              {cards.map((c) => (
                <div key={c} className="rounded-md border border-line bg-ground/60 p-2">
                  <p className="text-[10px] leading-snug">{c}</p>
                  <p className="mt-1 text-[8px] text-t3">next step set</p>
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
      <Chrome title="outbound console — approval queue" />
      {[
        ["First touch — workflow observation", "Draft, awaiting approval", true],
        ["Follow-up — teardown attached", "Approved, scheduled", false],
        ["Close loop — day 21", "Draft, awaiting approval", true],
      ].map(([subject, state, needs]) => (
        <div key={subject as string} className={rowBase}>
          <div className="min-w-0">
            <p className="truncate text-[11px]">{subject}</p>
            <p className="text-[9px] text-t3">{state}</p>
          </div>
          {needs ? (
            <span className="shrink-0 rounded-full bg-t1 px-2.5 py-1 text-[9px] font-medium text-ground">
              Review
            </span>
          ) : (
            <span className="shrink-0 text-[9px] text-t3">Fri 9:00</span>
          )}
        </div>
      ))}
      <p className="px-4 pt-2 text-[9px] text-t3">
        Nothing sends without a human approval.
      </p>
    </div>
  );
}

export function AutomationRunsMock() {
  return (
    <div className="h-full text-t1">
      <Chrome title="automation — run log" />
      {[
        ["Enquiry intake → CRM", "Completed", "ok"],
        ["Proposal follow-up", "Completed", "ok"],
        ["Weekly client report", "Needs review", "brass"],
        ["Invoice reminder", "Completed", "ok"],
      ].map(([run, st, tone]) => (
        <div key={run as string} className={rowBase}>
          <span className="text-[11px]">{run}</span>
          <StatusChip tone={tone as "ok" | "brass"}>{st as string}</StatusChip>
        </div>
      ))}
    </div>
  );
}
