"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveTutorAvailabilityStep } from "@/server/actions/onboarding";
import { errorTextClass } from "../formStyles";
import type { WizardProfileState } from "../types";
import { DayRangeAvailabilityPicker } from "@/components/shared/DayRangeAvailabilityPicker";

export function AvailabilityStep({
  initial,
  onSaved,
  onBack,
}: {
  initial: WizardProfileState;
  onSaved: (patch: Partial<WizardProfileState>) => void;
  onBack: () => void;
}) {
  const [slots, setSlots] = useState(initial.availability);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (slots.length === 0) {
      setError("Add at least one availability slot.");
      return;
    }

    const formData = new FormData();
    formData.set("slotsJson", JSON.stringify(slots));

    startTransition(async () => {
      const result = await saveTutorAvailabilityStep(formData);
      if (result.ok) {
        onSaved({ availability: slots });
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-headline-md text-headline-md text-on-surface">Availability</h2>

      <DayRangeAvailabilityPicker slots={slots} onChange={setSlots} />

      {error && <p className={errorTextClass}>{error}</p>}

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="font-label-md text-label-md text-secondary px-6 py-3">
          Back
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </form>
  );
}
