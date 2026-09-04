import Link from "next/link";
import { MobileNav } from "./MobileNav";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Find a Tutor", href: "/request-tutor" },
  { label: "Become a Tutor", href: "/register" },
  { label: "For Schools", href: "/#for-schools" },
  { label: "Courses", href: "/#courses" },
  { label: "About Us", href: "/#about" },
];

export function PublicHeader({ active = "Home" }: { active?: string }) {
  return (
    <header className="bg-surface-container-lowest shadow-sm sticky top-0 z-50 transition-colors duration-200 relative">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
          Tuition Serve
        </Link>

        <nav className="hidden md:flex gap-gutter items-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.label === active
                  ? "text-primary border-b-2 border-primary pb-1 font-bold font-label-md text-label-md transition-colors duration-200"
                  : "text-secondary font-medium font-label-md text-label-md hover:text-primary transition-colors duration-200"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-md">
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
