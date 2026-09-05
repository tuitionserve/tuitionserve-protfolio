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

      <svg aria-hidden="true" viewBox="0 0 1440 420" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%] min-h-64 w-full">
        <defs>
          <linearGradient id="mesh-surface" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#99f6cf" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="mesh-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.16" />
            <stop offset="55%" stopColor="#10b981" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.32" />
          </linearGradient>
          <filter id="mesh-glow" x="-15%" y="-20%" width="130%" height="150%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M0,210 C145,105 295,320 500,205 C675,108 785,256 965,160 C1110,82 1260,76 1440,142 L1440,420 L0,420 Z" fill="url(#mesh-surface)" />
        <g fill="none" stroke="url(#mesh-line)" filter="url(#mesh-glow)">
          <path strokeWidth="1" d="M-50,225 C145,105 295,320 500,205 C675,108 785,256 965,160 C1110,82 1260,76 1490,142" />
          <path strokeWidth="1.3" d="M-50,260 C145,140 295,355 500,240 C675,143 785,291 965,195 C1110,117 1260,111 1490,177" />
          <path strokeWidth="1.6" d="M-50,300 C145,180 295,395 500,280 C675,183 785,331 965,235 C1110,157 1260,151 1490,217" />
          <path strokeWidth="1.9" d="M-50,345 C145,225 295,440 500,325 C675,228 785,376 965,280 C1110,202 1260,196 1490,262" />
          <path strokeWidth="2.2" d="M-50,395 C145,275 295,490 500,375 C675,278 785,426 965,330 C1110,252 1260,246 1490,312" />
          <path strokeWidth="1" d="M60,170 C30,260 130,320 140,420 M245,135 C215,260 330,330 340,420 M445,165 C410,270 520,340 530,420 M655,150 C620,275 730,350 740,420 M870,120 C835,270 955,345 965,420 M1085,95 C1055,240 1180,330 1190,420 M1305,105 C1270,235 1390,320 1405,420" />
        </g>
      </svg>
    </div>
  );
}
