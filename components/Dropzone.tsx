"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ACCEPTED = ["image/jpeg", "image/webp", "image/png"];
const ACCEPTED_EXT = [".jpg", ".jpeg", ".webp", ".png"];
const MAX_BYTES = 10 * 1024 * 1024;

function isAccepted(file: File) {
  if (ACCEPTED.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXT.some((ext) => name.endsWith(ext));
}

type Props = {
  label: string;
  sublabel: string;
  file: File | null;
  onChange: (f: File | null) => void;
};

export default function Dropzone({ label, sublabel, file, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (!f) return;
      if (!isAccepted(f)) {
        toast.error("Only JPG, PNG, and WEBP files are supported.");
        return;
      }
      if (f.size > MAX_BYTES) {
        toast.error("File exceeds the 10 MB limit.");
        return;
      }
      onChange(f);
    },
    [onChange],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !file && inputRef.current?.click()}
      className={[
        "group relative rounded-2xl border bg-white aspect-square",
        "flex flex-col items-center justify-center overflow-hidden",
        "transition-all duration-200 cursor-pointer select-none",
        dragOver
          ? "border-olive ring-2 ring-olive/20 bg-[#FBF7EC]"
          : "border-border hover:border-olive/40",
        file ? "cursor-default" : "",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/webp,image/png,.jpg,.jpeg,.webp,.png"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent p-3 text-white">
            <span className="text-xs font-medium tracking-wide truncate">
              {label}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="rounded-full bg-white/15 hover:bg-white/25 backdrop-blur p-1.5 transition"
                aria-label="Replace image"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="rounded-full bg-white/15 hover:bg-white/25 backdrop-blur p-1.5 transition"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="rounded-full bg-cream p-3 text-olive">
            <ImagePlus className="h-6 w-6" strokeWidth={1.6} />
          </div>
          <div>
            <div className="font-serif text-2xl leading-tight text-ink">
              {label}
            </div>
            <div className="mt-1 text-sm text-muted">{sublabel}</div>
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
            JPG · PNG · WEBP
          </div>
        </div>
      )}
    </div>
  );
}
