import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/public/StaticPageLayout";

export const metadata: Metadata = {
  title: "Contact Us - Tuition Serve",
  description: "Get in touch with Tuition Serve.",
};

// TODO: swap the placeholder email/phone below for the client's real
// contact details once provided.
export default function ContactPage() {
  return (
    <StaticPageLayout active="Contact Us" title="Contact Us" subtitle="We'd love to hear from you.">
      <p>Have a question about finding a tutor, becoming a tutor, or anything else? Reach out:</p>
      <ul>
        <li>Email: support@tuitionserve.com</li>
        <li>Phone: +977-XXXXXXXXXX</li>
      </ul>
      <p>
        Looking for a tutor?{" "}
        <a href="/request-tutor" className="text-primary-container font-medium">
          Submit your requirements here
        </a>{" "}
        instead — it&rsquo;s the fastest way to get matched.
      </p>
    </StaticPageLayout>
  );
}
