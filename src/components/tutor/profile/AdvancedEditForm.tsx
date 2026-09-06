"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GRADES, QUALIFICATIONS, SUBJECTS } from "@/lib/catalog";
import { submitProfileChangeRequest } from "@/server/actions/profile-changes";
import type { TutorProfile } from "@/server/domain/types";

const inputClass =
  "border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full";
const labelClass = "font-label-md text-label-md text-on-surface-variant";
const fieldWrapClass = "flex flex-col gap-2";
const errorTextClass = "font-body-sm text-body-sm text-error mt-1";

export function AdvancedEditForm({ profile }: { profile: Omit<TutorProfile, "updatedAt"> }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [highestQualification, setHighestQualification] = useState(profile.highestQualification ?? "");
  const [institution, setInstitution] = useState(profile.institution ?? "");
  const [majorSubject, setMajorSubject] = useState(profile.majorSubject ?? "");
  const [currentProgram, setCurrentProgram] = useState(profile.currentProgram ?? "");
  const [currentYearOrSemester, setCurrentYearOrSemester] = useState(profile.currentYearOrSemester ?? "");
  const isCurrentlyDegreeLevel = highestQualification === "BACHELORS" || highestQualification === "MASTERS";
  const [subjects, setSubjects] = useState<string[]>(profile.subjects);
  const [grades, setGrades] = useState<string[]>(profile.grades);
  const [expectedMonthlyFee, setExpectedMonthlyFee] = useState(profile.expectedMonthlyFee?.toString() ?? "");
  const [preferredLocality, setPreferredLocality] = useState(profile.preferredLocality ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("phone", phone);
    formData.set("address", address);
    formData.set("highestQualification", highestQualification);
    formData.set("institution", institution);
    formData.set("majorSubject", majorSubject);
    if (isCurrentlyDegreeLevel) {
      formData.set("currentProgram", currentProgram);
      formData.set("currentYearOrSemester", currentYearOrSemester);
    }
    subjects.forEach((s) => formData.append("subjects", s));
    grades.forEach((g) => formData.append("grades", g));
    formData.set("expectedMonthlyFee", expectedMonthlyFee);
    formData.set("preferredLocality", preferredLocality);

    startTransition(async () => {
      const result = await submitProfileChangeRequest(formData);
      if (result.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  if (done) {
    return (
      <div className="bg-primary-container/10 border border-primary-container rounded-xl p-lg">
        <p className="font-label-md text-label-md text-on-surface">Change request submitted.</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          An admin will review it — your live profile won&rsquo;t change until it&rsquo;s approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        These changes go to an admin for approval before they take effect on your live profile — they won&rsquo;t
        apply immediately.
      </p>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="fullName">Full name</label>
        <input id="fullName" className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        {fieldErrors.fullName && <p className={errorTextClass}>{fieldErrors.fullName}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="phone">Phone</label>
        <input id="phone" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        {fieldErrors.phone && <p className={errorTextClass}>{fieldErrors.phone}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="address">Address</label>
        <input id="address" className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} required />
        {fieldErrors.address && <p className={errorTextClass}>{fieldErrors.address}</p>}
      </div>

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

      <div className={fieldWrapClass}>
        <label className={labelClass}>Subjects taught</label>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <label key={s.id} className="flex items-center gap-1.5 border border-outline-variant rounded-lg px-3 py-1.5 cursor-pointer has-checked:border-primary-container has-checked:bg-primary-container/10">
              <input type="checkbox" checked={subjects.includes(s.id)} onChange={() => toggle(subjects, setSubjects, s.id)} />
              <span className="font-body-sm text-body-sm">{s.label}</span>
            </label>
          ))}
        </div>
        {fieldErrors.subjects && <p className={errorTextClass}>{fieldErrors.subjects}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass}>Grades taught</label>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <label key={g.id} className="flex items-center gap-1.5 border border-outline-variant rounded-lg px-3 py-1.5 cursor-pointer has-checked:border-primary-container has-checked:bg-primary-container/10">
              <input type="checkbox" checked={grades.includes(g.id)} onChange={() => toggle(grades, setGrades, g.id)} />
              <span className="font-body-sm text-body-sm">{g.label}</span>
            </label>
          ))}
        </div>
        {fieldErrors.grades && <p className={errorTextClass}>{fieldErrors.grades}</p>}
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

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="preferredLocality">Preferred locality / area</label>
        <input
          id="preferredLocality"
          className={inputClass}
          value={preferredLocality}
          onChange={(e) => setPreferredLocality(e.target.value)}
          required
        />
        {fieldErrors.preferredLocality && <p className={errorTextClass}>{fieldErrors.preferredLocality}</p>}
      </div>

      {error && <p className={errorTextClass}>{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit for Approval"}
      </button>
    </form>
  );
}
