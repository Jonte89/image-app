import { redirect } from "next/navigation";
import ImageMixer from "@/components/ImageMixer";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.name?.trim() || user.email;

  return (
    <main className="min-h-screen px-5 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4 mb-10">
          <p className="text-sm text-muted">
            Signed in as{" "}
            <span className="font-medium text-ink">{displayName}</span>
          </p>
          <LogoutButton />
        </div>

        <header className="text-center mb-12 md:mb-16">
          <h1 className="font-serif text-6xl md:text-8xl leading-none text-ink">
            AI Image Mixer
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted max-w-xl mx-auto">
            Upload a target and a reference image. We&rsquo;ll blend them into
            something new.
          </p>
        </header>

        <ImageMixer />

        <footer className="mt-20 text-center text-xs uppercase tracking-[0.22em] text-muted">
          Made with care · Powered by n8n
        </footer>
      </div>
    </main>
  );
}
