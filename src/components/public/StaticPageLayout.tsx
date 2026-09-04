import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export function StaticPageLayout({
  active,
  title,
  subtitle,
  children,
}: {
  active?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PublicHeader active={active} />
      <main className="flex-1 w-full px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto">
        <div className="max-w-[48rem] mx-auto flex flex-col gap-lg">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{title}</h1>
            {subtitle && (
              <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
            )}
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-md [&_h2]:font-headline-sm [&_h2]:text-headline-sm [&_h2]:text-on-surface [&_h2]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
            {children}
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
