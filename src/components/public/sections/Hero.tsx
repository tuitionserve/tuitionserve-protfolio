import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function Hero() {
  return (
    <section className="w-full px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
        <div className="md:col-span-6 flex flex-col gap-lg z-10">
          <h1 className="hidden md:block font-display-lg text-display-lg text-on-surface">
            Find the Right Tutor for Your Learning Journey
          </h1>
          <h1 className="block md:hidden font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            Find the Right Tutor for Your Learning Journey
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
            Connect with verified educators, personalized to your academic goals. Experience
            reliable, high-quality tuition designed for steady progress.
          </p>
          <div className="flex flex-wrap gap-md mt-sm">
            <Link
              href="/request-tutor"
              className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 min-h-[44px]"
            >
              <MaterialIcon name="search" />
              Find a Tutor
            </Link>
            <Link
              href="/register"
              className="bg-transparent border border-secondary text-secondary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-container transition-all min-h-[44px] flex items-center"
            >
              Become a Tutor
            </Link>
          </div>
        </div>
        <div className="md:col-span-6 relative">
          <div className="absolute inset-0 bg-primary-container/10 rounded-full blur-3xl -z-10 transform scale-90 translate-x-10 translate-y-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="A teacher and student engaged in a home tuition session"
            className="w-full h-auto object-cover rounded-xl shadow-md border border-surface-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN8RX5vMPsbD82PxMq7K8gsWLNXwrAiQfs3jwL_Z9aRFrPS5s10VjWHC7j8_I1OLyiTw6VOfyzd4NFHiuEwRdxHlVD3wUD5LZRfnUDhO3Ijxe06kRk7UlKy3e_ishmKtZxst0bWO7lOES_kQueNzpcwvnIsOxonN8yvo4X7A30sXFpb0CPd9E7wVhabNUbYCv2DeJ1gZ3Ai3rVMQNfOgDUQHyk6zDI2kk6XHSk1JKIs4_ao6-uWoj9bg"
          />
        </div>
      </div>
    </section>
  );
}
