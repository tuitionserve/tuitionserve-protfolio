"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function CopyLinkButton({
  path,
  label = "Copy share link",
  copiedLabel = "Link copied",
  variant = "outline",
}: {
  path: string;
  label?: string;
  copiedLabel?: string;
  variant?: "outline" | "filled";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const baseClass =
    variant === "filled"
      ? "bg-primary-container text-on-primary"
      : "border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary-container";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 font-label-md text-label-md px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${baseClass}`}
    >
      <MaterialIcon name={copied ? "check" : "content_copy"} className="text-[16px]" />
      {copied ? copiedLabel : label}
    </button>
  );
}
