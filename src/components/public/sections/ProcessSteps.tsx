const STEPS = [
  {
    number: 1,
    icon: "person_search",
    title: "Submit Requirements",
    description: "Tell us about your subject, class, and location preferences through our easy search form.",
  },
  {
    number: 2,
    icon: "handshake",
    title: "Get Matched",
    description: "We review your requirements and connect you with verified, highly qualified tutors in your area.",
  },
  {
    number: 3,
    icon: "menu_book",
    title: "Start Learning",
    description: "Begin your educational journey with confidence, tracking progress and achieving your goals.",
  },
] as const;

export function ProcessSteps() {
  return (
    <section className="w-full bg-surface-container-low py-xxl">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <div className="text-center mb-xl">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">How Tuition Serve Works</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            A simple, transparent process to connect with the best educators.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-outline-variant/30 z-0" />
          {STEPS.map((step) => (
            <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-lowest border-4 border-surface-container-low flex items-center justify-center shadow-sm mb-6 relative">
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md shadow-sm">
                  {step.number}
                </div>
                <span className="material-symbols-outlined text-4xl text-primary-container">{step.icon}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{step.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[20rem]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
