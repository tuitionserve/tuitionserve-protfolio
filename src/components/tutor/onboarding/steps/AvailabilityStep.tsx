"use client";

import { useState, useTransition, type FormEvent } from "react";
import { DAYS_OF_WEEK } from "@/lib/catalog";
import { saveTutorAvailabilityStep } from "@/server/actions/onboarding";
import { errorTextClass, inputClass } from "../formStyles";
import type { AvailabilitySlotState, WizardProfileState } from "../types";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const EMPTY_SLOT: AvailabilitySlotState = { dayOfWeek: "SUN", startTime: "17:00", endTime: "19:00" };

export function AvailabilityStep({
  initial,
  onSaved,
  onBack,
}: {
  initial: WizardProfileState;
  onSaved: (patch: Partial<WizardProfileState>) => void;
  onBack: () => void;
}) {
  const [slots, setSlots] = useState<AvailabilitySlotState[]>(
    initial.availability.length > 0 ? initial.availability : [EMPTY_SLOT],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateSlot(index: number, patch: Partial<AvailabilitySlotState>) {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

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

      <div className="flex flex-col gap-3">
        {slots.map((slot, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <select
              className={`${inputClass} w-auto`}
              value={slot.dayOfWeek}
              onChange={(e) => updateSlot(index, { dayOfWeek: e.target.value })}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
            <input
              type="time"
              className={`${inputClass} w-auto`}
              value={slot.startTime}
              onChange={(e) => updateSlot(index, { startTime: e.target.value })}
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant">to</span>
            <input
              type="time"
              className={`${inputClass} w-auto`}
              value={slot.endTime}
              onChange={(e) => updateSlot(index, { endTime: e.target.value })}
            />
            {slots.length > 1 && (
              <button
                type="button"
                onClick={() => setSlots((prev) => prev.filter((_, i) => i !== index))}
                aria-label="Remove slot"
                className="text-error"
              >
                <MaterialIcon name="close" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setSlots((prev) => [...prev, EMPTY_SLOT])}
        className="self-start font-label-md text-label-md text-primary-container flex items-center gap-1"
      >
        <MaterialIcon name="add" /> Add slot
      </button>

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
