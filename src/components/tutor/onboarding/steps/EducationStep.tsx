"use client";

import { useState, useTransition, type FormEvent } from "react";
import { QUALIFICATIONS } from "@/lib/catalog";
import { EARLIEST_BS_GRADUATION_YEAR, getCurrentBsYear } from "@/lib/nepali-calendar";
import { saveTutorEducationStep } from "@/server/actions/onboarding";
import { errorTextClass, fieldWrapClass, inputClass, labelClass } from "../formStyles";
import type { WizardProfileState } from "../types";

const BS_GRADUATION_YEARS = Array.from(
  { length: getCurrentBsYear() - EARLIEST_BS_GRADUATION_YEAR + 1 },
  (_, i) => getCurrentBsYear() - i,
);

export function EducationStep({
  initial,
  onSaved,
  onBack,
}: {
  initial: WizardProfileState;
  onSaved: (patch: Partial<WizardProfileState>) => void;
  onBack: () => void;
}) {
  const [highestQualification, setHighestQualification] = useState(initial.highestQualification ?? "");
  const [institution, setInstitution] = useState(initial.institution ?? "");
  const [graduationYear, setGraduationYear] = useState(initial.graduationYear?.toString() ?? "");
  const [majorSubject, setMajorSubject] = useState(initial.majorSubject ?? "");
  const [currentProgram, setCurrentProgram] = useState(initial.currentProgram ?? "");
  const [currentYearOrSemester, setCurrentYearOrSemester] = useState(initial.currentYearOrSemester ?? "");
  const [error, setError] = useState<string | null>(null);
  const isCurrentlyDegreeLevel = highestQualification === "BACHELORS" || highestQualification === "MASTERS";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.set("highestQualification", highestQualification);
    formData.set("institution", institution);
    formData.set("graduationYear", graduationYear);
    formData.set("majorSubject", majorSubject);
    if (isCurrentlyDegreeLevel) {
      formData.set("currentProgram", currentProgram);
      formData.set("currentYearOrSemester", currentYearOrSemester);
    }

    startTransition(async () => {
      const result = await saveTutorEducationStep(formData);
      if (result.ok) {
        onSaved({
          highestQualification,
          institution,
          graduationYear: Number(graduationYear),
          majorSubject,
          currentProgram: isCurrentlyDegreeLevel ? currentProgram || null : null,
          currentYearOrSemester: isCurrentlyDegreeLevel ? currentYearOrSemester || null : null,
        });
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-headline-md text-headline-md text-on-surface">Education</h2>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="highestQualification">Highest qualification</label>
        <select
          id="highestQualification"
          className={inputClass}
          value={highestQualification}
          onChange={(e) => setHighestQualification(e.target.value)}
          required
        >
          <option value="" disabled>Select qualification</option>
          {QUALIFICATIONS.map((q) => (
            <option key={q.id} value={q.id}>{q.label}</option>
          ))}
        </select>
        {fieldErrors.highestQualification && <p className={errorTextClass}>{fieldErrors.highestQualification}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="institution">Institution</label>
        <input id="institution" className={inputClass} value={institution} onChange={(e) => setInstitution(e.target.value)} required />
        {fieldErrors.institution && <p className={errorTextClass}>{fieldErrors.institution}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="graduationYear">Graduation year (B.S.)</label>
        <select
          id="graduationYear"
          className={inputClass}
          value={graduationYear}
          onChange={(e) => setGraduationYear(e.target.value)}
          required
        >
          <option value="" disabled>Select graduation year</option>
          {BS_GRADUATION_YEARS.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        {fieldErrors.graduationYear && <p className={errorTextClass}>{fieldErrors.graduationYear}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="majorSubject">Major / subject</label>
        <input id="majorSubject" className={inputClass} value={majorSubject} onChange={(e) => setMajorSubject(e.target.value)} required />
        {fieldErrors.majorSubject && <p className={errorTextClass}>{fieldErrors.majorSubject}</p>}
      </div>

      {isCurrentlyDegreeLevel && (
        <>
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="currentProgram">Current course / program (optional)</label>
            <input
              id="currentProgram"
              className={inputClass}
              placeholder="e.g. BSc Computer Science"
              value={currentProgram}
              onChange={(e) => setCurrentProgram(e.target.value)}
            />
            {fieldErrors.currentProgram && <p className={errorTextClass}>{fieldErrors.currentProgram}</p>}
          </div>

          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="currentYearOrSemester">Current year / semester (optional)</label>
            <input
              id="currentYearOrSemester"
              className={inputClass}
              placeholder="e.g. 4th semester"
              value={currentYearOrSemester}
              onChange={(e) => setCurrentYearOrSemester(e.target.value)}
            />
            {fieldErrors.currentYearOrSemester && <p className={errorTextClass}>{fieldErrors.currentYearOrSemester}</p>}
          </div>
        </>
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
