"use client";

import { useState, useTransition, type FormEvent } from "react";
import { DAYS_OF_WEEK } from "@/lib/catalog";
import { saveTutorAvailabilityStep } from "@/server/actions/onboarding";
import { errorTextClass, inputClass } from "../formStyles";
import type { AvailabilitySlotState, WizardProfileState } from "../types";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const DAY_ORDER: string[] = DAYS_OF_WEEK.map((d) => d.id);

function dayLabel(id: string): string {
  return DAYS_OF_WEEK.find((d) => d.id === id)?.label ?? id;
}

export function AvailabilityStep({
  initial,
  onSaved,
  onBack,
}: {
  initial: WizardProfileState;
  onSaved: (patch: Partial<WizardProfileState>) => void;
  onBack: () => void;
}) {
  const [slots, setSlots] = useState<AvailabilitySlotState[]>(initial.availability);
  const [fromDay, setFromDay] = useState("SUN");
  const [toDay, setToDay] = useState("SUN");
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("19:00");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // "Sunday to Tuesday" adds one slot per day in that range (inclusive),
  // rather than making the tutor add each day one at a time — they can
  // click Add again for a second range (e.g. Thursday to Friday) with a
  // different time.
  function handleAddRange() {
    const fromIndex = DAY_ORDER.indexOf(fromDay);
    const toIndex = DAY_ORDER.indexOf(toDay);
    const rangeLength = ((toIndex - fromIndex + DAY_ORDER.length) % DAY_ORDER.length) + 1;
    const daysInRange = Array.from(
      { length: rangeLength },
      (_, i) => DAY_ORDER[(fromIndex + i) % DAY_ORDER.length]!,
    );

    setSlots((prev) => [
      ...prev,
      ...daysInRange.map((dayOfWeek) => ({ dayOfWeek, startTime, endTime })),
    ]);
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

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
      <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
        Pick a day range and a time, then add it. Add again for another range with a different time
        (e.g. Sunday to Tuesday evenings, then Thursday to Friday mornings).
      </p>

      <div className="flex flex-wrap items-end gap-2 bg-surface-container rounded-lg p-3">
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface-variant">From day</label>
          <select className={`${inputClass} w-auto`} value={fromDay} onChange={(e) => setFromDay(e.target.value)}>
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface-variant">To day</label>
          <select className={`${inputClass} w-auto`} value={toDay} onChange={(e) => setToDay(e.target.value)}>
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface-variant">Start time</label>
          <input type="time" className={`${inputClass} w-auto`} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface-variant">End time</label>
          <input type="time" className={`${inputClass} w-auto`} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <button
          type="button"
          onClick={handleAddRange}
          className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all flex items-center gap-1"
        >
          <MaterialIcon name="add" /> Add
        </button>
      </div>

      {slots.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-label-md text-label-md text-on-surface-variant">Added slots</p>
          {slots.map((slot, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 border border-surface-variant rounded-lg px-3 py-2"
            >
              <span className="font-body-sm text-body-sm text-on-surface">
                {dayLabel(slot.dayOfWeek)}, {slot.startTime}–{slot.endTime}
              </span>
              <button
                type="button"
                onClick={() => removeSlot(index)}
                aria-label="Remove slot"
                className="text-error"
              >
                <MaterialIcon name="close" />
              </button>
            </div>
          ))}
        </div>
      )}

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
