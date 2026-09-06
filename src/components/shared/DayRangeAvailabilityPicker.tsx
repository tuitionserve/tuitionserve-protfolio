"use client";

import { useState } from "react";
import { DAYS_OF_WEEK } from "@/lib/catalog";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export interface AvailabilitySlotState {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const DAY_ORDER: string[] = DAYS_OF_WEEK.map((d) => d.id);

function dayLabel(id: string): string {
  return DAYS_OF_WEEK.find((d) => d.id === id)?.label ?? id;
}

const inputClass =
  "border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20";

/**
 * "Sunday to Friday, 5-7pm" style picker — pick a day range and a time,
 * add it, repeat for another range with a different time. Shared by
 * tutor onboarding's Availability step and the parent-facing tuition
 * request form (originally only the former had this; the latter used a
 * slower one-day-at-a-time picker).
 */
export function DayRangeAvailabilityPicker({
  slots,
  onChange,
}: {
  slots: AvailabilitySlotState[];
  onChange: (slots: AvailabilitySlotState[]) => void;
}) {
  const [fromDay, setFromDay] = useState("SUN");
  const [toDay, setToDay] = useState("SUN");
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("19:00");

  function handleAddRange() {
    const fromIndex = DAY_ORDER.indexOf(fromDay);
    const toIndex = DAY_ORDER.indexOf(toDay);
    const rangeLength = ((toIndex - fromIndex + DAY_ORDER.length) % DAY_ORDER.length) + 1;
    const daysInRange = Array.from(
      { length: rangeLength },
      (_, i) => DAY_ORDER[(fromIndex + i) % DAY_ORDER.length]!,
    );
    onChange([...slots, ...daysInRange.map((dayOfWeek) => ({ dayOfWeek, startTime, endTime }))]);
  }

  function removeSlot(index: number) {
    onChange(slots.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
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
              <button type="button" onClick={() => removeSlot(index)} aria-label="Remove slot" className="text-error">
                <MaterialIcon name="close" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
