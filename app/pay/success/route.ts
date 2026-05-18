import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Landing point after Stripe Checkout. The Payment Link redirects the buyer
 * here with `?session_id={CHECKOUT_SESSION_ID}`. We re-fetch the session from
 * Stripe (authoritative — the query string itself is not trusted), confirm it
 * is paid and belongs to the signed-in user, then store the Stripe customer id
 * on the profile so future gate checks can look up the live subscription.
 */
export async function GET(req: NextRequest) {
  const { origin } = req.nextUrl;
  const sessionId = req.nextUrl.searchParams.get("session_id");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", origin));
  }
  if (!sessionId) {
    return NextResponse.redirect(new URL("/pay?status=error", origin));
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    const isPaid = session.payment_status === "paid";
    const belongsToUser = session.client_reference_id === user.id;

    if (!isPaid || !belongsToUser) {
      return NextResponse.redirect(new URL("/pay?status=error", origin));
    }

    if (typeof session.customer === "string") {
      const admin = createAdminClient();
      const { error } = await admin
        .from("profiles")
        .update({ stripe_customer_id: session.customer })
        .eq("id", user.id);

      if (error) {
        return NextResponse.redirect(new URL("/pay?status=error", origin));
      }
    }
  } catch {
    return NextResponse.redirect(new URL("/pay?status=error", origin));
  }

  return NextResponse.redirect(new URL("/", origin));
}
