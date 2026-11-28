"use client";

import { useEffect, useRef } from "react";
import { getAdSenseClientId, isAdUnitEnabled } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

/**
 * Renders a responsive Google AdSense display/in-article unit.
 * Renders nothing (`null`) until both `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
 * and the slot's numeric ID env var are configured, avoiding empty boxes
 * or layout shift before AdSense activation.
 */
export function AdBanner({
  slotId,
  format = "auto",
  layout,
  className = "",
}: {
  slotId: string | null | undefined;
  format?: "auto" | "fluid" | "rectangle";
  layout?: "in-article";
  className?: string;
}) {
  const pushedRef = useRef(false);
  const clientId = getAdSenseClientId();
  const active = isAdUnitEnabled(slotId);

  useEffect(() => {
    if (!active || pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore adblocker or duplicate-push errors cleanly
    }
  }, [active]);

  if (!active || !clientId || !slotId) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={`w-full rounded-xl border border-surface-variant bg-surface-container-low/60 px-3 py-2 flex flex-col items-center gap-1 overflow-hidden ${className}`}
    >
      <span className="font-label-md text-[10px] uppercase tracking-[0.14em] text-on-surface-variant/70">
        Advertisement
      </span>
      <div className="w-full min-h-[90px] flex items-center justify-center">
        <ins
          className="adsbygoogle block w-full text-center"
          style={{ display: "block" }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          {...(layout ? { "data-ad-layout": layout } : {})}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
