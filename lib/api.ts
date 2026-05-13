const WEBHOOK_URL =
  "https://jonte88.app.n8n.cloud/webhook/1aab6d30-f146-4bea-937d-ea02e860575a";

export async function generateImage(image1: File, image2: File): Promise<Blob> {
  const fd = new FormData();
  fd.append("image1", image1);
  fd.append("image2", image2);

  const res = await fetch(WEBHOOK_URL, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);
  return res.blob();
}
