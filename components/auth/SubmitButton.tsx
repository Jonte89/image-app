import { Loader2 } from "lucide-react";

type Props = {
  loading: boolean;
  children: React.ReactNode;
};

/** Pill-shaped primary submit button for auth forms. */
export default function SubmitButton({ loading, children }: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={[
        "inline-flex w-full items-center justify-center gap-2",
        "rounded-full px-8 py-3 text-sm font-medium tracking-wide",
        "bg-olive text-cream shadow-sm transition-all",
        "hover:bg-ink active:scale-[0.98]",
        "disabled:bg-[#B8B2A0] disabled:text-white/80 disabled:cursor-not-allowed disabled:active:scale-100",
      ].join(" ")}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{children}</span>
    </button>
  );
}
