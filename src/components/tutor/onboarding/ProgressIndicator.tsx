const STEP_LABELS = ["Personal", "Education", "Teaching", "Location", "Availability", "CV", "Review"];

export function ProgressIndicator({ currentIndex }: { currentIndex: number }) {
  return (
    <ol className="flex flex-wrap gap-2 mb-8">
      {STEP_LABELS.map((label, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
        return (
          <li
            key={label}
            className={`font-label-md text-label-md px-3 py-1 rounded-full border ${
              state === "current"
                ? "bg-primary-container text-on-primary border-primary-container"
                : state === "done"
                  ? "bg-primary-container/10 text-primary-container border-primary-container/40"
                  : "bg-surface-container text-on-surface-variant border-surface-variant"
            }`}
          >
            {index + 1}. {label}
          </li>
        );
      })}
    </ol>
  );
}
