"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Dropzone from "./Dropzone";
import GenerateButton from "./GenerateButton";
import ResultPanel from "./ResultPanel";
import { generateImage } from "@/lib/api";

export default function ImageMixer() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const onGenerate = async () => {
    if (!file1 || !file2 || loading) return;
    setLoading(true);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    try {
      const blob = await generateImage(file1, file2);
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = !!file1 && !!file2;

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Dropzone
          label="Target Image"
          sublabel="The person to dress."
          file={file1}
          onChange={setFile1}
        />
        <Dropzone
          label="Reference Image"
          sublabel="The clothing to apply."
          file={file2}
          onChange={setFile2}
        />
      </section>

      <GenerateButton
        disabled={!canGenerate}
        loading={loading}
        onClick={onGenerate}
      />

      <ResultPanel imageUrl={resultUrl} loading={loading} />
    </div>
  );
}
