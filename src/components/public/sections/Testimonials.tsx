const TESTIMONIALS = [
  {
    quote:
      "Finding a math tutor for my son in Lalitpur was a breeze. The tutor matched by Tuition Serve is not only knowledgeable but incredibly patient. His grades have improved significantly.",
    initial: "S",
    name: "Sita Sharma",
    role: "Parent, Lalitpur",
    bg: "bg-primary-container/20 text-primary-container",
  },
  {
    quote:
      "As a university student, I wanted to earn while teaching subjects I excel at. Tuition Serve provided a professional platform to connect with students easily.",
    initial: "R",
    name: "Rahul Shrestha",
    role: "Tutor, Kathmandu",
    bg: "bg-secondary-container/20 text-secondary",
  },
  {
    quote:
      "The interface is clean and safe. I found an excellent science teacher for my high school finals within a day. Highly recommend their verified network.",
    initial: "A",
    name: "Aayush Gurung",
    role: "Student, Pokhara",
    bg: "bg-tertiary-container/20 text-tertiary",
  },
] as const;

export function Testimonials() {
  return (
    <section className="w-full px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto">
      <div className="text-center mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Hear From Our Community</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Success stories from students, parents, and educators.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg shadow-sm flex flex-col relative"
          >
            <span className="material-symbols-outlined text-4xl text-outline-variant/30 absolute top-4 right-4">
              format_quote
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant italic mb-6 relative z-10 flex-grow">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-4 mt-auto border-t border-surface-variant pt-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline-sm ${t.bg}`}>
                {t.initial}
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface">{t.name}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
