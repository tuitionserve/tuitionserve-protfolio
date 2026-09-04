"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Find a Tutor", href: "/request-tutor" },
  { label: "Become a Tutor", href: "/register" },
  { label: "For Schools", href: "/for-schools" },
  { label: "Courses", href: "/courses" },
  { label: "About Us", href: "/about" },
];

export function MobileNav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex flex-col justify-center items-center gap-1.5 w-11 h-11 -mr-2"
      >
        <motion.span
          animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          className="block w-6 h-0.5 bg-secondary rounded-full"
        />
        <motion.span
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          className="block w-6 h-0.5 bg-secondary rounded-full"
        />
        <motion.span
          animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          className="block w-6 h-0.5 bg-secondary rounded-full"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 w-full bg-surface-container-lowest shadow-md overflow-hidden"
          >
            <div className="flex flex-col px-margin-mobile py-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={
                    link.label === active
                      ? "py-3 font-bold font-label-md text-label-md text-primary border-b border-surface-variant"
                      : "py-3 font-medium font-label-md text-label-md text-secondary border-b border-surface-variant last:border-b-0"
                  }
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center font-label-md text-label-md text-secondary border border-secondary px-4 py-3 rounded-lg min-h-[44px] flex items-center justify-center"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center font-label-md text-label-md bg-primary-container text-on-primary px-4 py-3 rounded-lg shadow-sm min-h-[44px] flex items-center justify-center"
                >
                  Signup
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
