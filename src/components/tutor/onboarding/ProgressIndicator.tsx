import { STEP_LABELS } from "./completeness";

export function ProgressIndicator({
  currentIndex,
  onStepClick,
}: {
  currentIndex: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <ol className="flex flex-wrap gap-2 mb-8">
      {STEP_LABELS.map((label, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
        return (
          <li key={label}>
            <button
              type="button"
              onClick={() => onStepClick(index)}
              className={`font-label-md text-label-md px-3 py-1 rounded-full border transition-colors ${
                state === "current"
                  ? "bg-primary-container text-on-primary border-primary-container"
                  : state === "done"
                    ? "bg-primary-container/10 text-primary-container border-primary-container/40 hover:bg-primary-container/20"
                    : "bg-surface-container text-on-surface-variant border-surface-variant hover:bg-surface-container-lowest"
              }`}
            >
              {index + 1}. {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
