import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, WhatsappIcon } from "./SocialIcons";

// Social profile URLs are placeholders ("#") until the client provides
// the real links — swap the hrefs below when they're available.
const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "WhatsApp", href: "#", Icon: WhatsappIcon },
];

const linkClass =
  "font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary";

export function PublicFooter() {
  return (
    <footer className="bg-secondary-fixed mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter w-full px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto">
        <div className="flex flex-col gap-4 md:col-span-1">
          <Image src="/images/logo.svg" alt="Tuition Serve" width={180} height={40} className="h-10 w-auto" />
          <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant">
            © {new Date().getFullYear()} Tuition Serve. Empowering education through
            personalized learning.
          </p>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a key={label} href={href} aria-label={label} className="text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/" className={linkClass}>Home</Link>
          <Link href="/request-tutor" className={linkClass}>Find a Tutor</Link>
          <Link href="/register" className={linkClass}>Become a Tutor</Link>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/for-schools" className={linkClass}>For Schools</Link>
          <Link href="/courses" className={linkClass}>Courses</Link>
          <Link href="/about" className={linkClass}>About Us</Link>
          <Link href="/contact" className={linkClass}>Contact Us</Link>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/privacy-policy" className={linkClass}>Privacy Policy</Link>
          <Link href="/terms-of-service" className={linkClass}>Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
