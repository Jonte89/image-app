type Props = {
  label: string;
  id: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

/** Labelled text input matching the warm editorial form style. */
export default function AuthField({ label, id, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        className={[
          "rounded-xl border border-border bg-cream px-4 py-2.5 text-sm text-ink",
          "placeholder:text-muted/60 outline-none transition-colors",
          "focus:border-olive focus:ring-2 focus:ring-olive/15",
          "disabled:opacity-60",
        ].join(" ")}
        {...props}
      />
    </div>
  );
}
