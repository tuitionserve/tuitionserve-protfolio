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

export default function HomePage() {
  return (
    <>
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
