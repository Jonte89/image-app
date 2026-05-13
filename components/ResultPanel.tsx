"use client";

import { Download, Image as ImageIcon } from "lucide-react";

type Props = {
  imageUrl: string | null;
  loading: boolean;
};

export default function ResultPanel({ imageUrl, loading }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-3xl md:text-4xl text-ink">Result</h2>
        {imageUrl && !loading && (
          <a
            href={imageUrl}
            download="ai-image-mixer.png"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream hover:bg-olive transition"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        )}
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-white aspect-square md:aspect-[4/5] max-h-[80vh]">
        {loading && <div className="absolute inset-0 shimmer" />}

        {!loading && imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt="Generated result"
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}

        {!loading && !imageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
            <ImageIcon className="h-8 w-8" strokeWidth={1.4} />
            <p className="text-sm">Your generated image will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
