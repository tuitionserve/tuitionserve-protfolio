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

export default function HomePage() {
  return (
    <>
      <PublicHeader active="Home" />
      <main>
        <Hero />
        <TrustStrip />
        <AudienceCards />
        <RequestTutorSearch />
        <ProcessSteps />
        <StatsStrip />
        <Testimonials />
        <Faq />
      </main>
      <PublicFooter />
    </>
  );
}
