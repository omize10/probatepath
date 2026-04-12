import Stripe from "stripe";

/**
 * Stripe client singleton.
 *
 * Returns null when STRIPE_SECRET_KEY is not configured. Callers should
 * check for null and gracefully fall back to the no-charge beta flow so the
 * site keeps working until billing is turned on.
 *
 * To enable real billing in production:
 *   1. Create a Stripe account at https://dashboard.stripe.com
 *   2. Add these env vars in Vercel:
 *        STRIPE_SECRET_KEY        sk_live_...   (or sk_test_... for testing)
 *        STRIPE_WEBHOOK_SECRET    whsec_...     (from Dashboard → Developers → Webhooks)
 *        STRIPE_PUBLISHABLE_KEY   pk_live_...   (only needed if you switch to client-side Elements)
 *   3. Add a webhook in the Stripe Dashboard pointed at:
 *        https://www.probatedesk.com/api/webhooks/stripe
 *      Events to forward:
 *        - checkout.session.completed
 *        - charge.refunded
 *
 * Once those env vars are set and the next deploy lands, /pay will start
 * sending customers to Stripe Checkout instead of the beta-payment form.
 */

let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  cached = new Stripe(key, {
    // Pin the API version so a Stripe upgrade can never silently break us.
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    typescript: true,
    appInfo: {
      name: "ProbateDesk",
      version: "1.0.0",
      url: "https://www.probatedesk.com",
    },
  });
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
