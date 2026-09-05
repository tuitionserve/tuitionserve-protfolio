import Image from "next/image";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function NotFound() {
  return (
    <div className="min-h-full flex-1 flex flex-col items-center justify-center px-margin-mobile py-xl text-center">
      <div className="relative mb-2">
        <Image
          src="/icon.svg"
          alt=""
          width={96}
          height={96}
          className="w-20 h-20 md:w-24 md:h-24 opacity-90"
          priority
        />
      </div>

      <p className="font-headline-lg text-headline-lg font-bold text-primary-container mt-2">404</p>
      <h1 className="font-headline-md text-headline-md text-on-surface mt-1">
        This page wandered off somewhere
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-3 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist, may have moved, or the link might be
        broken. Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all"
        >
          <MaterialIcon name="home" className="text-xl" />
          Go to homepage
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 border border-secondary text-secondary font-label-md text-label-md rounded-lg px-6 py-3 hover:bg-surface-container transition-all"
        >
          <MaterialIcon name="login" className="text-xl" />
          Log in
        </Link>
      </div>
    </div>
  );
}
