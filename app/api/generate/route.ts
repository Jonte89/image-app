import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function validateImage(file: unknown, field: string): File | NextResponse {
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: `Missing ${field}` },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json(
      { error: `${field} is empty` },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `${field} exceeds 10 MB limit` },
      { status: 413 },
    );
  }
  if (!ACCEPTED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `${field} must be JPG, PNG, or WEBP` },
      { status: 415 },
    );
  }
  return file;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authoritative paywall check — live subscription status, never the client.
  if (!(await hasActiveSubscription(supabase, user))) {
    return NextResponse.json(
      { error: "An active subscription is required" },
      { status: 402 },
    );
  }

  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Server is not configured" },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const v1 = validateImage(form.get("image1"), "image1");
  if (v1 instanceof NextResponse) return v1;
  const v2 = validateImage(form.get("image2"), "image2");
  if (v2 instanceof NextResponse) return v2;

  const upstream = new FormData();
  upstream.append("image1", v1);
  upstream.append("image2", v2);

  let res: Response;
  try {
    res = await fetch(webhookUrl, { method: "POST", body: upstream });
  } catch {
    return NextResponse.json(
      { error: "Upstream unreachable" },
      { status: 502 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream error (${res.status})` },
      { status: 502 },
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "Upstream did not return an image" },
      { status: 502 },
    );
  }

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      "Content-Disposition": 'inline; filename="result"',
    },
  });
}
