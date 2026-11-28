import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/session";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Hero } from "@/components/public/sections/Hero";
import { TrustStrip } from "@/components/public/sections/TrustStrip";
import { AudienceCards } from "@/components/public/sections/AudienceCards";
import { RequestTutorSearch } from "@/components/public/sections/RequestTutorSearch";
import { ProcessSteps } from "@/components/public/sections/ProcessSteps";
import { StatsStrip } from "@/components/public/sections/StatsStrip";
import { Testimonials } from "@/components/public/sections/Testimonials";
import { Faq } from "@/components/public/sections/Faq";
import { FadeIn } from "@/components/ui/FadeIn";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const HOME_FAQS = [
  {
    question: "How are the tutors verified?",
    answer:
      "We conduct a rigorous background check, verify academic credentials, and interview each tutor to ensure high educational standards and safety.",
  },
  {
    question: "Can I choose the location for tuition?",
    answer:
      "Yes, you can request home tuition where the tutor comes to your residence, or opt for online sessions depending on availability and your preference.",
  },
  {
    question: "What happens if I'm not satisfied with the tutor?",
    answer:
      "We offer a transparent feedback system. If you feel the match isn't right after the first few sessions, contact our support team and we will arrange a replacement at no extra matching cost.",
  },
];

export default async function HomePage() {
  const session = await getCurrentSession();
  if (session) {
    redirect(session.role === "TUTOR" ? "/tutor/dashboard" : "/admin/dashboard");
  }

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={faqJsonLd(HOME_FAQS)} />
      <PublicHeader active="Home" />
      <main>
        <Hero />
        <FadeIn>
          <TrustStrip />
        </FadeIn>
        <FadeIn>
          <AudienceCards />
        </FadeIn>
        <FadeIn>
          <RequestTutorSearch />
        </FadeIn>
        <FadeIn>
          <ProcessSteps />
        </FadeIn>
        <FadeIn>
          <StatsStrip />
        </FadeIn>
        <FadeIn>
          <Testimonials />
        </FadeIn>
        <FadeIn>
          <Faq />
        </FadeIn>
      </main>
      <PublicFooter />
    </>
  );
}
