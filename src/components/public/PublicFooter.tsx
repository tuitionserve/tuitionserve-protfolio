import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-secondary-fixed mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter w-full px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto">
        <div className="flex flex-col gap-4 md:col-span-1">
          <div className="font-headline-sm text-headline-sm font-bold text-on-secondary-fixed">
            Tuition Serve
          </div>
          <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant">
            © {new Date().getFullYear()} Tuition Serve. Empowering education through
            personalized learning.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/request-tutor"
            className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary"
          >
            Find a Tutor
          </Link>
          <Link
            href="/register"
            className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary"
          >
            Become a Tutor
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href="#for-schools"
            className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary"
          >
            For Schools
          </a>
          <a
            href="#about"
            className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary"
          >
            About Us
          </a>
          <a
            href="#contact"
            className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary"
          >
            Contact Us
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href="#privacy"
            className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80 hover:opacity-100 hover:text-primary"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
