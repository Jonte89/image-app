import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/** Subscription statuses that grant access to the app. */
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * Returns true if the user currently has an active paid subscription.
 *
 * This is checked live against Stripe on every gate, so a cancelled or lapsed
 * subscription locks the user out immediately — there is no cached flag to go
 * stale. The Stripe customer is resolved from the id stored on the profile,
 * falling back to an email lookup (and persisting the id) so a buyer who closed
 * the tab before the post-checkout redirect is still recognised.
 *
 * Server-only — relies on STRIPE_SECRET_KEY and the service-role key.
 */
export async function hasActiveSubscription(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  const stripe = getStripe();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId: string | null = profile?.stripe_customer_id ?? null;

  // Fallback: no id stored yet — find the customer by email.
  if (!customerId && user.email) {
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 10,
    });
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 10,
      });
      if (subs.data.some((s) => ACTIVE_STATUSES.has(s.status))) {
        customerId = customer.id;
        break;
      }
    }
    if (customerId) {
      await createAdminClient()
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }
  }

  if (!customerId) return false;

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });
  return subscriptions.data.some((s) => ACTIVE_STATUSES.has(s.status));
}
