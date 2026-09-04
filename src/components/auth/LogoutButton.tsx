"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutCurrentUser } from "@/lib/auth/client-actions";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await signOutCurrentUser();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        className ??
        "font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-60"
      }
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
