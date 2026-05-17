"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full border border-border px-4 py-2 text-xs font-medium",
        "text-muted transition-colors hover:text-ink hover:border-ink/30",
        "disabled:opacity-60",
      ].join(" ")}
    >
      <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} />
      <span>Sign out</span>
    </button>
  );
}
