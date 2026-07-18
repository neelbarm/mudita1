/**
 * Stripe checkout, env-gated, raw fetch. Enough for an MVP's "take
 * money" moment; grow into the SDK only when the product demands it.
 */
const key = process.env.STRIPE_API_KEY;

export const stripeConfigured = Boolean(key);

export async function createCheckoutSession(opts: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}): Promise<{ url: string } | null> {
  if (!stripeConfigured) {
    console.warn("stripe not configured; checkout disabled");
    return null;
  }
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": opts.priceId,
    "line_items[0][quantity]": "1",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    ...(opts.customerEmail ? { customer_email: opts.customerEmail } : {}),
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    console.error(`stripe checkout: ${res.status}`);
    return null;
  }
  const data = (await res.json()) as { url: string };
  return { url: data.url };
}
