import ImageMixer from "@/components/ImageMixer";

export default function Page() {
  return (
    <main className="min-h-screen px-5 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
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
