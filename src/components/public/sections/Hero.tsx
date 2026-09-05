import Link from "next/link";
import Image from "next/image";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { FadeIn } from "@/components/ui/FadeIn";

export function Hero() {
  return (
    <section className="w-full px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
        <FadeIn className="md:col-span-6 flex flex-col gap-lg z-10" direction="left" mode="mount">
          <h1 className="hidden md:block font-display-lg text-display-lg text-on-surface">
            Find the Right Tutor for Your Learning Journey
          </h1>
          <h1 className="block md:hidden font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            Find the Right Tutor for Your Learning Journey
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[32rem]">
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
        </FadeIn>
        <FadeIn className="md:col-span-6 relative" direction="right" delay={0.15} mode="mount">
          <div className="absolute inset-0 bg-primary-container/10 rounded-full blur-3xl -z-10 transform scale-90 translate-x-10 translate-y-10" />
          <Image
            alt="A teacher and student engaged in a home tuition session"
            className="w-full h-auto object-cover rounded-xl shadow-md border border-surface-variant"
            src="/images/hero.jpg"
            width={512}
            height={279}
            style={{ height: "auto" }}
            unoptimized
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </FadeIn>
      </div>
    </section>
  );
}
