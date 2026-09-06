"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * WhatsApp-Web-style master-detail frame: list pane + thread pane side
 * by side on desktop. On mobile there's room for only one at a time —
 * this reads the URL itself (rather than the server layout trying to
 * thread a "is a thread open" flag down through params) to decide which
 * pane to show, since `basePath` (no id segment) means "list view" and
 * anything past it means a thread is open.
 */
export function MessagingShell({
  basePath,
  listPane,
  children,
}: {
  basePath: string;
  listPane: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isThreadOpen = pathname !== basePath;

  return (
    <div className="flex h-[75vh] min-h-[560px] rounded-2xl border border-surface-variant overflow-hidden bg-surface-container-lowest">
      <div
        className={`w-full md:w-80 shrink-0 border-r border-surface-variant flex-col overflow-hidden ${
          isThreadOpen ? "hidden md:flex" : "flex"
        }`}
      >
        {listPane}
      </div>
      <div className={`flex-1 min-w-0 flex-col overflow-hidden ${isThreadOpen ? "flex" : "hidden md:flex"}`}>
        {children}
      </div>
    </div>
  );
}
