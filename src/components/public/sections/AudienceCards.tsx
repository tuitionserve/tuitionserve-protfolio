import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const CARDS = [
  {
    icon: "home",
    title: "Home Tuition",
    description:
      "Find dedicated home tutors for personalized, one-on-one academic support in your area.",
    cta: "Find a Home Tutor",
    href: "/request-tutor",
    iconWrap: "bg-primary-container/10 text-primary-container group-hover:bg-primary-container group-hover:text-on-primary",
    ctaColor: "text-primary-container",
  },
  {
    icon: "apartment",
    title: "School/Institution",
    description:
      "Partner with us to source qualified teachers and educational professionals for your institution.",
    cta: "Contact Us",
    href: "/#contact",
    iconWrap: "bg-secondary-container/30 text-on-secondary-container group-hover:bg-secondary group-hover:text-on-secondary",
    ctaColor: "text-secondary",
  },
  {
    icon: "person_add",
    title: "Become a Tutor",
    description: "Join our network of verified educators and start shaping the minds of tomorrow.",
    cta: "Apply as Tutor",
    href: "/register",
    iconWrap: "bg-tertiary-container/30 text-on-tertiary-container group-hover:bg-tertiary group-hover:text-on-tertiary",
    ctaColor: "text-tertiary",
  },
] as const;

export function AudienceCards() {
  return (
    <section className="w-full px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto mt-lg">
      <div className="text-center mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">How Can We Help You?</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Select your path to find tailored educational support.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${card.iconWrap}`}
            >
              <MaterialIcon name={card.icon} />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{card.title}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 flex-grow">
              {card.description}
            </p>
            <span className={`font-label-md text-label-md flex items-center gap-1 mt-auto ${card.ctaColor}`}>
              {card.cta}
              <MaterialIcon name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
