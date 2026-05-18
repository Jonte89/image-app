import Stripe from "stripe";

/**
 * Stripe client. Server-only — `STRIPE_SECRET_KEY` must never reach the browser.
 * Throws lazily so a missing key surfaces a clear error in the route that uses it.
 */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}
