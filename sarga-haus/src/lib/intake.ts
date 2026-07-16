/**
 * Intake schema shared by the form (client) and the API route (server),
 * so validation cannot drift between the two.
 */

export const CATEGORIES = [
  { value: "product", label: "Product", hint: "An MVP, portal, tool, or app that needs to exist" },
  { value: "automation", label: "Automation", hint: "An operation running by hand that should run itself" },
  { value: "pipeline", label: "Pipeline", hint: "Demand infrastructure: targeting, outreach, CRM motion" },
  { value: "combination", label: "A combination", hint: "Some or all of the above, as one system" },
] as const;

export const TIMELINES = [
  { value: "now", label: "As soon as possible" },
  { value: "quarter", label: "Within this quarter" },
  { value: "exploring", label: "Exploring, no fixed date" },
] as const;

export const BUDGETS = [
  { value: "under_10k", label: "Under $10k" },
  { value: "10k_25k", label: "$10k – $25k" },
  { value: "25k_60k", label: "$25k – $60k" },
  { value: "60k_plus", label: "$60k+" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export type IntakePayload = {
  name: string;
  email: string;
  company?: string;
  link?: string;
  building: string;
  broken?: string;
  impact?: string;
  category: string;
  timeline: string;
  budget: string;
  tools?: string;
  notes?: string;
  // honeypot: must stay empty
  website?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateIntake(data: Partial<IntakePayload>) {
  const errors: Partial<Record<keyof IntakePayload, string>> = {};

  if (!data.name?.trim()) errors.name = "Your name helps us reply like humans.";
  else if (data.name.trim().length > 200) errors.name = "That name looks too long.";

  if (!data.email?.trim()) errors.email = "We need an email to reply to.";
  else if (!EMAIL_RE.test(data.email.trim())) errors.email = "That email does not look right.";

  if (!data.building?.trim())
    errors.building = "One or two sentences is enough. What should exist?";
  else if (data.building.trim().length < 10)
    errors.building = "Give us a little more than that.";

  if (!data.category || !CATEGORIES.some((c) => c.value === data.category))
    errors.category = "Pick the closest fit.";
  if (!data.timeline || !TIMELINES.some((t) => t.value === data.timeline))
    errors.timeline = "Pick the closest fit.";
  if (!data.budget || !BUDGETS.some((b) => b.value === data.budget))
    errors.budget = "An honest range is enough.";

  for (const key of ["company", "link", "broken", "impact", "tools", "notes"] as const) {
    const v = data[key];
    if (v && v.length > 4000) errors[key] = "Please keep this under 4000 characters.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
