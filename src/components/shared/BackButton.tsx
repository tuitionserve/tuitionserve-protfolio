"use client";

import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

/**
 * Goes back to wherever the user actually came from (browser history),
 * rather than a hardcoded destination — several detail pages here can be
 * reached from more than one list (e.g. a tuition can be opened from
 * New/Open/Assigned/Applications), so a fixed "back to X" link would
 * often be wrong.
 */
export function BackButton({ label = "Back", className = "" }: { label?: string; className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline-flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors ${className}`}
    >
      <MaterialIcon name="arrow_back" className="text-lg" />
      {label}
    </button>
  );
}
