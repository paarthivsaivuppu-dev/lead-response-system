"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button
      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-muted transition hover:bg-cyan-50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
      disabled={loading}
      onClick={handleLogout}
      type="button"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
