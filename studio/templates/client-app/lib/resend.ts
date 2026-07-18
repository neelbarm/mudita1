/** Transactional email via Resend, env-gated, raw fetch. */
const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM;

export const emailConfigured = Boolean(key && from);

export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!emailConfigured) {
    console.warn("email not configured; skipped send");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) console.error(`resend: ${res.status}`);
  return res.ok;
}
