"use client";

import { useState, useTransition, type FormEvent } from "react";
import { GRADES, SUBJECTS } from "@/lib/catalog";
import { saveTutorTeachingStep } from "@/server/actions/onboarding";
import { errorTextClass, fieldWrapClass, inputClass, labelClass } from "../formStyles";
import type { WizardProfileState } from "../types";

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function TeachingStep({
  initial,
  onSaved,
  onBack,
}: {
  initial: WizardProfileState;
  onSaved: (patch: Partial<WizardProfileState>) => void;
  onBack: () => void;
}) {
  const [subjects, setSubjects] = useState<string[]>(initial.subjects);
  const [grades, setGrades] = useState<string[]>(initial.grades);
  const [teachingExperienceSummary, setTeachingExperienceSummary] = useState(
    initial.teachingExperienceSummary ?? "",
  );
  const [expectedMonthlyFee, setExpectedMonthlyFee] = useState(initial.expectedMonthlyFee?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    subjects.forEach((s) => formData.append("subjects", s));
    grades.forEach((g) => formData.append("grades", g));
    formData.set("teachingExperienceSummary", teachingExperienceSummary);
    formData.set("expectedMonthlyFee", expectedMonthlyFee);

    startTransition(async () => {
      const result = await saveTutorTeachingStep(formData);
      if (result.ok) {
        onSaved({
          subjects,
          grades,
          teachingExperienceSummary,
          expectedMonthlyFee: Number(expectedMonthlyFee),
        });
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-headline-md text-headline-md text-on-surface">Teaching</h2>

      <div className={fieldWrapClass}>
        <span className={labelClass}>Subjects</span>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <label
              key={s.id}
              className={`font-body-sm text-body-sm px-3 py-2 rounded-lg border cursor-pointer ${
                subjects.includes(s.id)
                  ? "bg-primary-container/10 border-primary-container text-primary-container"
                  : "border-outline-variant text-on-surface-variant"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={subjects.includes(s.id)}
                onChange={() => setSubjects((prev) => toggle(prev, s.id))}
              />
              {s.label}
            </label>
          ))}
        </div>
        {fieldErrors.subjects && <p className={errorTextClass}>{fieldErrors.subjects}</p>}
      </div>

      <div className={fieldWrapClass}>
        <span className={labelClass}>Grades</span>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <label
              key={g.id}
              className={`font-body-sm text-body-sm px-3 py-2 rounded-lg border cursor-pointer ${
                grades.includes(g.id)
                  ? "bg-primary-container/10 border-primary-container text-primary-container"
                  : "border-outline-variant text-on-surface-variant"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={grades.includes(g.id)}
                onChange={() => setGrades((prev) => toggle(prev, g.id))}
              />
              {g.label}
            </label>
          ))}
        </div>
        {fieldErrors.grades && <p className={errorTextClass}>{fieldErrors.grades}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="teachingExperienceSummary">Teaching experience</label>
        <textarea
          id="teachingExperienceSummary"
          className={inputClass}
          rows={3}
          value={teachingExperienceSummary}
          onChange={(e) => setTeachingExperienceSummary(e.target.value)}
          placeholder="Briefly summarize your teaching experience"
        />
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="expectedMonthlyFee">Expected monthly fee (NPR)</label>
        <input
          id="expectedMonthlyFee"
          type="number"
          className={inputClass}
          value={expectedMonthlyFee}
          onChange={(e) => setExpectedMonthlyFee(e.target.value)}
          required
        />
        {fieldErrors.expectedMonthlyFee && <p className={errorTextClass}>{fieldErrors.expectedMonthlyFee}</p>}
      </div>

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
