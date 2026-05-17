import Link from "next/link";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: { prompt: string; href: string; label: string };
};

/** Shared editorial-style shell for the login and signup screens. */
export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="font-serif text-5xl md:text-6xl leading-none text-ink">
            {title}
          </h1>
          <p className="mt-4 text-base text-muted">{subtitle}</p>
        </header>

        <div className="rounded-2xl border border-border bg-white/60 p-7 shadow-sm">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {footer.prompt}{" "}
          <Link
            href={footer.href}
            className="font-medium text-ink underline underline-offset-4 hover:text-olive"
          >
            {footer.label}
          </Link>
        </p>
      </div>
    </main>
  );
}
