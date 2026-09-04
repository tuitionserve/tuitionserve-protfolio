"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export interface TabLink {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

/**
 * Fixed bottom tab bar for the authenticated tutor/admin shells —
 * mobile-only (md:hidden). This is the deliberate "feels like a native
 * app, not a shrunk website" pattern: a hamburger drawer reads as a
 * website, a bottom tab bar reads as an app. Desktop keeps the existing
 * top nav via the sibling `hidden md:flex` nav in each layout.
 */
export function BottomTabBar({ links }: { links: TabLink[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-surface-variant z-40 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="flex items-stretch justify-around">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] relative ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className="relative">
                <MaterialIcon name={link.icon} filled={active} className="text-2xl" />
                {!!link.badge && (
                  <span className="absolute -top-1 -right-2 bg-primary-container text-on-primary text-[10px] leading-none font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {link.badge}
                  </span>
                )}
              </span>
              <span className={`font-label-md text-[11px] leading-none ${active ? "font-bold" : "font-medium"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
