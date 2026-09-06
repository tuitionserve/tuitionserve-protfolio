import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SchoolContactForm } from "@/components/public/contact/SchoolContactForm";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";

export const metadata: Metadata = {
  title: "For Schools - Tuition Serve",
  description: "Partner with Tuition Serve to source qualified teachers and educational professionals for your school.",
};

export default function ForSchoolsPage() {
  return (
    <>
      <PublicHeader active="For Schools" />
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto w-full">
        <div className="max-w-2xl mx-auto flex flex-col gap-lg">
          <div>
            <p className="font-label-md text-label-md font-bold uppercase tracking-[0.14em] text-primary-container mb-2">
              School &amp; institution partnerships
            </p>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">For Schools</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Need qualified teachers or educational professionals for your institution? Tell us what you&rsquo;re
              looking for and our partnerships team will get back to you.
            </p>
          </div>
          <SchoolContactForm />

          <div className="flex flex-col items-center gap-3 border-t border-surface-variant pt-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Prefer to chat instead?</p>
            <WhatsAppButton message="Hi Tuition Serve, I'm reaching out on behalf of a school about a teacher partnership." />
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
