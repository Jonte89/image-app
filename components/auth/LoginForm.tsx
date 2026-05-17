"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import AuthField from "./AuthField";
import SubmitButton from "./SubmitButton";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        autoComplete="current-password"
        placeholder="••••••••"
        required
        disabled={loading}
      />
      <div className="mt-2">
        <SubmitButton loading={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </SubmitButton>
      </div>
    </form>
  );
}
