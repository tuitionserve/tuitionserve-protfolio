import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { PUBLIC_NAV_LINKS, isNavLinkActive } from "./nav-links";

export function PublicHeader({ active = "Home" }: { active?: string }) {
  return (
    <header className="bg-surface-container-lowest shadow-sm sticky top-0 z-50 transition-colors duration-200 relative">
      <div className="flex justify-between items-center gap-4 w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/images/logo.svg" alt="Tuition Serve" width={128} height={32} className="h-8 w-auto md:h-9" priority />
        </Link>

        <nav className="hidden lg:flex gap-5 xl:gap-gutter items-center">
          {PUBLIC_NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                isNavLinkActive(link, active)
                  ? "text-primary border-b-2 border-primary pb-1 font-bold font-label-md text-label-md whitespace-nowrap transition-colors duration-200"
                  : "text-secondary font-medium font-label-md text-label-md whitespace-nowrap hover:text-primary transition-colors duration-200"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-md shrink-0">
          <Link
            href="/login"
            className="font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-surface-container-lowest transition-colors min-h-[44px] flex items-center"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="font-label-md text-label-md bg-primary-container text-on-primary px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:bg-opacity-90 transition-all min-h-[44px] flex items-center"
          >
            Signup
          </Link>
        </div>

        <MobileNav active={active} />
      </div>
    </header>
  );
}
