import Link from "next/link";

export const metadata = { title: "Link problem · AI Image Mixer" };

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-5xl md:text-6xl leading-none text-ink">
          Link expired
        </h1>
        <p className="mt-4 text-base text-muted">
          This confirmation link is invalid or has already been used. Try
          signing in, or sign up again to get a fresh link.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-olive px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-ink"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
