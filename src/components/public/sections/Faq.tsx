"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const FAQS = [
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
] as const;

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full bg-surface-container-lowest border-t border-surface-variant py-xxl">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto max-w-3xl">
        <div className="text-center mb-xl">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Frequently Asked Questions</h2>
        </div>
        <div className="flex flex-col gap-sm">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className="border border-surface-variant rounded-lg bg-surface-container-lowest overflow-hidden">
                <button
                  type="button"
                  className="w-full flex justify-between items-center p-4 text-left hover:bg-surface-container-low transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-headline-sm text-headline-sm text-on-surface">{faq.question}</span>
                  <MaterialIcon
                    name="expand_more"
                    className={`text-secondary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="font-body-sm text-body-sm text-on-surface-variant pt-2 border-t border-surface-variant">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
