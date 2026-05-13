export async function generateImage(image1: File, image2: File): Promise<Blob> {
  const fd = new FormData();
  fd.append("image1", image1);
  fd.append("image2", image2);

  const res = await fetch("/api/generate", { method: "POST", body: fd });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // non-JSON response; keep generic message
    }
    throw new Error(message);
  }
  return res.blob();
}
