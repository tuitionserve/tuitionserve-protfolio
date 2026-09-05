import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ContactForm } from "@/components/public/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us - Tuition Serve",
  description: "Get in touch with Tuition Serve.",
};

export default function ContactPage() {
  return (
    <>
      <PublicHeader active="Contact Us" />
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto w-full">
        <div className="max-w-2xl mx-auto flex flex-col gap-lg">
          <div>
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
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
