import Image from "next/image";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function NotFound() {
  return (
    <div className="relative isolate min-h-full flex-1 overflow-hidden bg-[#f7fbf8] px-margin-mobile py-16 md:px-margin-desktop md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 opacity-70 [background-image:radial-gradient(#10b981_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-16 -z-10 h-64 w-64 rounded-full bg-primary-fixed/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-1/4 -z-10 h-72 w-72 rounded-full bg-tertiary-fixed/60 blur-3xl" />

      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <span className="not-found-float absolute left-[8%] top-[18%] rotate-[-12deg] rounded-2xl border border-primary/15 bg-white/70 p-3 shadow-sm backdrop-blur-sm"><MaterialIcon name="menu_book" className="text-3xl text-primary-container" /></span>
        <span className="not-found-float-delayed absolute right-[10%] top-[14%] rotate-[10deg] rounded-full border border-tertiary/15 bg-white/70 p-3 shadow-sm backdrop-blur-sm"><MaterialIcon name="school" className="text-3xl text-tertiary" /></span>
        <span className="not-found-float absolute bottom-[30%] left-[16%] rotate-[8deg] rounded-xl border border-primary/15 bg-white/70 p-2.5 shadow-sm backdrop-blur-sm"><MaterialIcon name="functions" className="text-2xl text-primary" /></span>
        <span className="not-found-float-delayed absolute bottom-[35%] right-[17%] rotate-[-10deg] rounded-xl border border-tertiary/15 bg-white/70 p-2.5 shadow-sm backdrop-blur-sm"><MaterialIcon name="lightbulb" className="text-2xl text-tertiary" /></span>
      </div>

      <main className="relative z-10 mx-auto flex min-h-[520px] max-w-2xl flex-col items-center justify-center text-center">
        <div className="relative mb-5">
          <div aria-hidden="true" className="absolute inset-0 scale-150 rounded-full bg-primary-fixed/50 blur-2xl" />
          <Image src="/temp%20assets/logo.png" alt="Tuition Serve" width={500} height={500} className="relative h-28 w-28 object-contain md:h-32 md:w-32" priority />
        </div>
        <p className="font-label-md text-label-md font-bold uppercase tracking-[0.18em] text-primary">Lesson not found</p>
        <p className="mt-2 font-display-lg text-6xl font-bold leading-none tracking-tight text-on-surface md:text-8xl">404</p>
        <h1 className="mt-4 font-headline-lg text-headline-lg text-on-surface md:text-[2.5rem]">This page wandered off somewhere.</h1>
        <p className="mt-4 w-full max-w-[32rem] px-2 font-body-md text-body-md leading-relaxed text-on-surface-variant md:px-0 md:text-lg">
          <span className="block">The lesson you&apos;re looking for may have moved, or the link may be out of date.</span>
          <span className="mt-1 block">Let&apos;s get you back on the right learning path.</span>
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-label-md text-label-md text-on-primary shadow-[0_12px_24px_-14px_rgba(0,108,73,0.8)] transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-primary-fixed"><MaterialIcon name="home" className="text-xl" />Go to homepage</Link>
          <Link href="/login" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-primary/25 bg-white/70 px-6 py-3 font-label-md text-label-md text-primary shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-primary-fixed"><MaterialIcon name="login" className="text-xl" />Log in</Link>
        </div>
      </main>

      <svg aria-hidden="true" viewBox="0 0 1440 420" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[46%] min-h-72 w-full">
        <defs>
          <linearGradient id="floor-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0" />
            <stop offset="55%" stopColor="#059669" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="grid-stroke" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="120">
            <stop offset="0%" stopColor="#047857" stopOpacity="0.6" />
            <stop offset="45%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="horizon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#34d399" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>
          <filter id="grid-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <ellipse className="not-found-glow-pulse" cx="720" cy="118" rx="420" ry="90" fill="url(#horizon-glow)" />

        <path d="M-120,420 L1560,420 L804,132 L636,132 Z" fill="url(#floor-fill)" />

        <g fill="none" stroke="url(#grid-stroke)" filter="url(#grid-glow)">
          {/* Radial verticals — parallel floor lines converging toward the horizon */}
          <path strokeWidth="1.4" d="M-120,420 L636,132" />
          <path strokeWidth="1.4" d="M60,420 L654,132" />
          <path strokeWidth="1.4" d="M240,420 L672,132" />
          <path strokeWidth="1.4" d="M420,420 L690,132" />
          <path strokeWidth="1.4" d="M600,420 L708,132" />
          <path strokeWidth="1.6" d="M720,420 L720,132" />
          <path strokeWidth="1.4" d="M840,420 L732,132" />
          <path strokeWidth="1.4" d="M1020,420 L750,132" />
          <path strokeWidth="1.4" d="M1200,420 L768,132" />
          <path strokeWidth="1.4" d="M1380,420 L786,132" />
          <path strokeWidth="1.4" d="M1560,420 L804,132" />
          <path strokeWidth="2.4" d="M-120,420 L1560,420" />
        </g>
      </svg>
    </div>
  );
}
