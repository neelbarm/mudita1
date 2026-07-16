import { NextResponse } from "next/server";
import { validateIntake, type IntakePayload } from "@/lib/intake";

export const runtime = "nodejs";

/**
 * Intake endpoint. Validates, then degrades gracefully by capability:
 * with Supabase env vars it stores; with Resend it notifies and confirms;
 * with neither it still accepts (and logs) so preview environments work.
 */

// Best-effort rate limit per instance. Real abuse control belongs at the edge.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_HITS;
}

async function storeInSupabase(payload: IntakePayload, meta: { source: string; userAgent: string }) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[intake] Supabase not configured; submission not persisted.");
    return;
  }
  const res = await fetch(`${url}/rest/v1/intake_submissions`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: payload.name.trim(),
      email: payload.email.trim(),
      company: payload.company?.trim() || null,
      link: payload.link?.trim() || null,
      building: payload.building.trim(),
      broken: payload.broken?.trim() || null,
      impact: payload.impact?.trim() || null,
      category: payload.category,
      timeline: payload.timeline || null,
      budget: payload.budget || null,
      tools: payload.tools?.trim() || null,
      notes: payload.notes?.trim() || null,
      source: meta.source,
      user_agent: meta.userAgent,
    }),
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
}

async function sendEmails(payload: IntakePayload) {
  const key = process.env.RESEND_API_KEY;
  const notify = process.env.INTAKE_NOTIFY_EMAIL;
  const from = process.env.INTAKE_FROM_EMAIL;
  if (!key || !from) {
    console.warn("[intake] Resend not configured; no emails sent.");
    return;
  }
  const send = (body: object) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  if (notify) {
    await send({
      from,
      to: [notify],
      subject: `New project enquiry: ${payload.category} — ${payload.name}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Company: ${payload.company || "-"}`,
        `Link: ${payload.link || "-"}`,
        `Category: ${payload.category} | Timeline: ${payload.timeline} | Budget: ${payload.budget}`,
        "",
        `Building: ${payload.building}`,
        `Broken today: ${payload.broken || "-"}`,
        `Expected impact: ${payload.impact || "-"}`,
        `Current tools: ${payload.tools || "-"}`,
        `Notes: ${payload.notes || "-"}`,
      ].join("\n"),
    });
  }

  await send({
    from,
    to: [payload.email.trim()],
    subject: "Received. Here is what happens next — Sarga Haus",
    text: [
      `Hi ${payload.name.trim().split(" ")[0]},`,
      "",
      "Your project brief landed. Thank you for the detail; it gets read carefully, by a person.",
      "",
      "What happens next:",
      "1. We review what you sent, usually within one business day.",
      "2. If it looks like a fit, you get a short reply with a call link and one or two sharp questions.",
      "3. If it is not a fit, you get a straight answer and, where we can, a pointer to someone better suited.",
      "",
      "Sarga Haus",
      "Build the product. Automate the workflow. Fill the pipeline.",
    ].join("\n"),
  });
}

export async function POST(req: Request) {
  let body: Partial<IntakePayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: bots fill every field. Pretend success, store nothing.
  if (body.website && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const { valid, errors } = validateIntake(body);
  if (!valid) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const payload = body as IntakePayload;
  const meta = {
    source: req.headers.get("referer") || "direct",
    userAgent: req.headers.get("user-agent") || "unknown",
  };

  try {
    await storeInSupabase(payload, meta);
  } catch (err) {
    // Storage failure must not eat a real lead: log loudly, still notify.
    console.error("[intake] storage error:", err);
  }

  try {
    await sendEmails(payload);
  } catch (err) {
    console.error("[intake] email error:", err);
  }

  return NextResponse.json({ ok: true });
}
