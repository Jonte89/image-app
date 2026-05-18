import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LogoutButton from "@/components/auth/LogoutButton";

export const dynamic = "force-dynamic";

/**
 * Stripe Payment Link for the €9.99/month subscription. This is a public URL
 * (every visitor sees it on the Subscribe button), so it lives in code rather
 * than an env var — that keeps it in lockstep with the deployed build. Swap
 * this for the live-mode link when going to production.
 */
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_5kQ28r2B3dcH5qP2L5fMA00";

const PERKS = [
  "Unlimited image generations",
  "Billed €9.99 every month — cancel anytime",
  "Full access to the AI Image Mixer",
];

export default async function PayPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (await hasActiveSubscription(supabase, user)) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const payUrl = `${STRIPE_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(
    user.id,
  )}&prefilled_email=${encodeURIComponent(user.email ?? "")}`;

  const firstName = profile?.name?.trim().split(/\s+/)[0];
  const verificationFailed = searchParams.status === "error";

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="font-serif text-5xl md:text-6xl leading-none text-ink">
            {firstName ? `One last step, ${firstName}` : "One last step"}
          </h1>
          <p className="mt-4 text-base text-muted">
            Subscribe to unlock the AI Image Mixer.
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-white/60 p-7 shadow-sm">
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-serif text-6xl text-ink">€9.99</span>
            <span className="text-sm text-muted">/ month</span>
          </div>

          <ul className="mt-6 flex flex-col gap-2.5">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-ink">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive"
                />
                {perk}
              </li>
            ))}
          </ul>

          {verificationFailed && (
            <p className="mt-6 rounded-xl border border-border bg-cream px-4 py-3 text-sm text-muted">
              We couldn&rsquo;t confirm your payment. If you were charged,
              wait a moment and reload — otherwise try again below.
            </p>
          )}

          <a
            href={payUrl}
            className="mt-7 flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-opacity hover:opacity-90"
          >
            Subscribe — €9.99 / month
          </a>

          <p className="mt-4 text-center text-xs text-muted">
            Secure checkout by Stripe. You&rsquo;ll return here automatically.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted">
          <span>Signed in as {user.email}</span>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
