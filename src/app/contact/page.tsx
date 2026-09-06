import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ContactForm } from "@/components/public/contact/ContactForm";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";

export const metadata: Metadata = {
  title: "Contact Us - Tuition Serve",
  description: "Get in touch with Tuition Serve — questions about finding a tutor, becoming a tutor, or anything else.",
};

export default function ContactPage() {
  return (
    <>
      <PublicHeader active="Contact Us" />
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto w-full">
        <div className="max-w-2xl mx-auto flex flex-col gap-lg">
          <div>
            <p className="font-label-md text-label-md font-bold uppercase tracking-[0.14em] text-primary-container mb-2">
              We&rsquo;d love to hear from you
            </p>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Contact Us</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Have a question about finding a tutor, becoming a tutor, or anything else? Send us a message and
              our team will get back to you — or reach us directly at{" "}
              <a href="mailto:tuitionserve@gmail.com" className="text-primary-container font-medium">
                tuitionserve@gmail.com
              </a>{" "}
              /{" "}
              <a href="tel:+9779765269150" className="text-primary-container font-medium">
                +977 976-5269150
              </a>
              .
            </p>
          </div>
          <ContactForm />

          <div className="flex flex-col items-center gap-3 border-t border-surface-variant pt-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Prefer to chat instead?</p>
            <WhatsAppButton message="Hi Tuition Serve, I have a question." />
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
