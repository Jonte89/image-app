"use client";

import { Loader2, Sparkles } from "lucide-react";

type Props = {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
};

export default function GenerateButton({ disabled, loading, onClick }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2",
          "rounded-full px-8 py-3.5 text-sm font-medium tracking-wide",
          "bg-olive text-cream shadow-sm transition-all",
          "hover:bg-ink active:scale-[0.98]",
          "disabled:bg-[#B8B2A0] disabled:text-white/80 disabled:cursor-not-allowed disabled:active:scale-100",
        ].join(" ")}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" strokeWidth={1.8} />
        )}
        <span>{loading ? "Generating…" : "Generate Image"}</span>
      </button>
      {loading && (
        <p className="text-sm text-muted">
          Processing AI… this may take a minute.
        </p>
      )}
    </div>
  );
}
