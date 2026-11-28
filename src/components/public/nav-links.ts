export interface PublicNavItem {
  key: string;
  label: string;
  href: string;
}

export const PUBLIC_NAV_LINKS: PublicNavItem[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "request", label: "Find a Tutor", href: "/request-tutor" },
  { key: "vacancies", label: "Vacancies", href: "/vacancies" },
  { key: "register", label: "Become a Tutor", href: "/register" },
  { key: "schools", label: "For Schools", href: "/for-schools" },
  { key: "courses", label: "Courses", href: "/courses" },
  { key: "blog", label: "Blog", href: "/blog" },
  { key: "about", label: "About Us", href: "/about" },
];

export function isNavLinkActive(link: PublicNavItem, active: string): boolean {
  const normalized = active.trim().toLowerCase();
  return link.key === normalized || link.label.toLowerCase() === normalized;
}
