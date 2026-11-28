import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { getAdSenseClientId } from "@/lib/ads";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const description =
  "Tuition Serve connects parents and schools across Nepal with verified home tutors and subject teachers. Browse open teaching vacancies, request a tutor, or read study guides.";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Tuition Serve — Home Tuition & Teaching Vacancies in Nepal",
    template: "%s | Tuition Serve",
  },
  description,
  keywords: [
    "home tuition Nepal",
    "home tutor Kathmandu",
    "home tutor Lalitpur",
    "home tutor Pokhara",
    "private tutor Nepal",
    "teaching vacancies Nepal",
    "Tuition Serve",
  ],
  alternates: {
    canonical: "/",
  },
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tuition Serve",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
  // og:image/twitter:image are supplied automatically by
  // src/app/opengraph-image.tsx (Next.js file convention) — declaring
  // them here too would emit duplicate tags.
  openGraph: {
    title: "Tuition Serve — Home Tuition & Teaching Vacancies in Nepal",
    description,
    type: "website",
    siteName: "Tuition Serve",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuition Serve — Home Tuition & Teaching Vacancies in Nepal",
    description,
  },
};

export const viewport = {
  themeColor: "#006c49",
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClientId = getAdSenseClientId();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Material Symbols is a variable icon font with no next/font entry; loaded as a regular stylesheet. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {adsenseClientId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-body-md">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
