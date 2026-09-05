"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { LogoutButton } from "@/components/auth/LogoutButton";

export interface SidebarLink {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface SidebarSection {
  /** Omit for an ungrouped leading section (e.g. just "Dashboard"). */
  label?: string;
  links: SidebarLink[];
}

const COLLAPSE_STORAGE_KEY = "ts-sidebar-collapsed";

/**
 * Desktop-only collapsible sidebar (the standard SaaS/AI-dashboard
 * pattern) — mobile keeps the fixed bottom tab bar instead, per the
 * earlier "should feel like an app, not a shrunk website" direction;
 * a sidebar doesn't fit that pattern at phone width.
 */
export function Sidebar({
  sections,
  roleLabel,
  homeHref,
  profileHref,
}: {
  sections: SidebarSection[];
  roleLabel: string;
  homeHref: string;
  profileHref: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
    } catch {
      // Private browsing / storage blocked — default to expanded.
    }
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore — nothing to persist to.
      }
      return next;
    });
  }

  const profileActive = pathname === profileHref;

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 bg-surface-container-lowest border-r border-surface-variant min-h-screen sticky top-0 transition-all ${
        collapsed ? "w-[68px]" : "w-60"
      } ${hydrated ? "" : "invisible"}`}
    >
      {/* Logo gets its own full-height row so it's never clipped. When
          collapsed, tapping the logo itself expands the sidebar (the
          modern pattern — a separate cramped toggle row felt bolted-on
          and confusing); when expanded, a chevron button collapses it. */}
      <div className={`flex items-center h-16 border-b border-surface-variant shrink-0 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-container transition-colors"
          >
            <Image src="/icon.svg" alt="Tuition Serve" width={32} height={32} className="w-8 h-8 shrink-0" />
          </button>
        ) : (
          <>
            <Link href={homeHref} className="flex items-center overflow-hidden">
              <Image src="/images/logo.svg" alt="Tuition Serve" width={128} height={32} className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
            >
              <MaterialIcon name="chevron_left" />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-3 p-2 overflow-y-auto">
        {sections.map((section, sectionIndex) => (
          <div key={section.label ?? sectionIndex} className="flex flex-col gap-1">
            {section.label && !collapsed && (
              <p className="font-label-md text-[11px] tracking-wide uppercase text-on-surface-variant/70 px-3 pt-2 pb-1">
                {section.label}
              </p>
            )}
            {section.label && collapsed && sectionIndex > 0 && (
              <div className="mx-2 my-1 border-t border-surface-variant" />
            )}
            {section.links.map((link) => {
              const active = link.href === homeHref ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md transition-colors relative ${
                    collapsed ? "justify-center" : ""
                  } ${
                    active
                      ? "bg-primary-container text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span className="relative shrink-0">
                    <MaterialIcon name={link.icon} filled={active} className="text-xl" />
                    {!!link.badge && collapsed && (
                      <span className="absolute -top-1.5 -right-1.5 bg-error text-on-error text-[10px] leading-none font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
                        {link.badge}
                      </span>
                    )}
                  </span>
                  {!collapsed && <span className="truncate">{link.label}</span>}
                  {!collapsed && !!link.badge && (
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
      </nav>

      {/* Footer, top to bottom: who's signed in, then Profile, then Sign Out. */}
      <div className={`border-t border-surface-variant p-2 flex flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
        {!collapsed && (
          <p className="font-body-sm text-body-sm text-on-surface-variant px-2 pb-1 truncate">{roleLabel}</p>
        )}
        <Link
          href={profileHref}
          title={collapsed ? "Profile" : undefined}
          className={`flex items-center gap-3 rounded-lg font-label-md text-label-md transition-colors ${
            collapsed ? "justify-center w-9 h-9" : "px-3 py-2"
          } ${profileActive ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:bg-surface-container"}`}
        >
          <MaterialIcon name="person" filled={profileActive} className="text-xl shrink-0" />
          {!collapsed && <span>Profile</span>}
        </Link>
        <LogoutButton
          className={
            collapsed
              ? "flex items-center justify-center w-9 h-9 rounded-lg text-secondary hover:bg-surface-container transition-colors"
              : "flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md text-secondary hover:bg-surface-container transition-colors text-left"
          }
        >
          <MaterialIcon name="logout" className="text-xl shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </LogoutButton>
      </div>
    </aside>
  );
}
