"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { SidebarSection } from "@/components/shared/Sidebar";

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
 *
 * `moreSections`/`profileHref` are optional: pass them once a role has
 * more sidebar destinations than fit as primary tabs (5 max, one of
 * which becomes "More") — the admin shell needs this now that its
 * sidebar has grown well past what a phone screen can show at once.
 * Without them, this renders exactly the plain tab row it always has.
 */
export function BottomTabBar({
  links,
  moreSections,
  profileHref,
  roleLabel,
}: {
  links: TabLink[];
  moreSections?: SidebarSection[];
  profileHref?: string;
  roleLabel?: string;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the "More" sheet whenever navigation actually happens (a Link
  // tap inside it, the browser back button, etc.) rather than leaving it
  // stuck open over the newly-loaded page.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMoreOpen(false);
  }

  const hasMore = !!moreSections && moreSections.length > 0;
  const allTabLinks = links.map((l) => l.href);

  // Same "most specific match wins" fix as Sidebar.tsx — a plain
  // startsWith() would light up multiple tabs whose hrefs share a prefix.
  const moreHrefs = hasMore ? moreSections!.flatMap((s) => s.links.map((l) => l.href)) : [];
  const bestMatch = [...allTabLinks, ...moreHrefs]
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
  const moreActive = hasMore && !!bestMatch && !allTabLinks.includes(bestMatch);
  const moreBadgeTotal = hasMore
    ? moreSections!.reduce((sum, s) => sum + s.links.reduce((s2, l) => s2 + (l.badge ?? 0), 0), 0)
    : 0;

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-surface-variant z-40 pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <div className="flex items-stretch justify-around">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === link.href : link.href === bestMatch;
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
          {hasMore && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="More"
              aria-expanded={moreOpen}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] relative ${
                moreActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className="relative">
                <MaterialIcon name="more_horiz" filled={moreActive} className="text-2xl" />
                {moreBadgeTotal > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary-container text-on-primary text-[10px] leading-none font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {moreBadgeTotal}
                  </span>
                )}
              </span>
              <span className={`font-label-md text-[11px] leading-none ${moreActive ? "font-bold" : "font-medium"}`}>
                More
              </span>
            </button>
          )}
        </div>
      </nav>

      {hasMore && moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative bg-surface-container-lowest rounded-t-2xl max-h-[75vh] flex flex-col pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-lg py-3.5 border-b border-surface-variant shrink-0">
              <p className="font-headline-sm text-headline-sm text-on-surface">More</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <MaterialIcon name="close" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {moreSections!.map((section, i) => (
                <div key={section.label ?? i} className="flex flex-col gap-1 mb-2">
                  {section.label && (
                    <p className="font-label-md text-[11px] tracking-wide uppercase text-on-surface-variant/70 px-3 pt-2 pb-1">
                      {section.label}
                    </p>
                  )}
                  {section.links.map((link) => {
                    const active = link.href === bestMatch;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md transition-colors ${
                          active ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        <MaterialIcon name={link.icon} filled={active} className="text-xl shrink-0" />
                        <span className="truncate">{link.label}</span>
                        {!!link.badge && (
                          <span
                            className={`ml-auto font-label-md text-label-md px-2 py-0.5 rounded-full ${
                              active ? "bg-on-primary/20 text-on-primary" : "bg-primary-container text-on-primary"
                            }`}
                          >
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}

              {profileHref && (
                <div className="flex flex-col gap-1 pt-2 mt-1 border-t border-surface-variant">
                  {roleLabel && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant px-3 pt-2 pb-1 truncate">
                      {roleLabel}
                    </p>
                  )}
                  <Link
                    href={profileHref}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md transition-colors ${
                      pathname === profileHref
                        ? "bg-primary-container text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <MaterialIcon name="person" filled={pathname === profileHref} className="text-xl shrink-0" />
                    Profile
                  </Link>
                  <LogoutButton className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md text-secondary hover:bg-surface-container transition-colors text-left">
                    <MaterialIcon name="logout" className="text-xl shrink-0" />
                    Sign Out
                  </LogoutButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
