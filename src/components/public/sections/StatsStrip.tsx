const STATS = [
  { value: "1000+", label: "Verified Teachers" },
  { value: "1000+", label: "Students Served" },
  { value: "50+", label: "Subjects Covered" },
  { value: "3", label: "Major Cities" },
] as const;

export function StatsStrip() {
  return (
    <section className="w-full bg-primary text-on-primary py-xl relative overflow-hidden">
      <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <span className="font-display-lg text-display-lg">{stat.value}</span>
              <span className="font-label-md text-label-md uppercase tracking-wide opacity-90">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
