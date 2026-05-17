"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import AuthField from "./AuthField";
import SubmitButton from "./SubmitButton";

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck className="h-9 w-9 text-olive" strokeWidth={1.6} />
        <h2 className="font-serif text-2xl text-ink">Check your email</h2>
        <p className="text-sm text-muted">
          We sent a confirmation link to{" "}
          <span className="font-medium text-ink">{sentTo}</span>. Click it to
          activate your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        label="Name"
        id="name"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Ada Lovelace"
        required
        disabled={loading}
      />
      <AuthField
        label="Email"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        disabled={loading}
      />
      <AuthField
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 6 characters"
        minLength={6}
        required
        disabled={loading}
      />
      <div className="mt-2">
        <SubmitButton loading={loading}>
          {loading ? "Creating account…" : "Create account"}
        </SubmitButton>
      </div>
    </form>
  );
}
