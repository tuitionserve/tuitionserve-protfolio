"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { DAYS_OF_WEEK, GRADES, SUBJECTS } from "@/lib/catalog";
import { submitSchoolVacancyAsAdmin } from "@/server/actions/school-vacancy";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { errorTextClass, fieldWrapClass, inputClass, labelClass, sectionClass } from "@/components/public/tuition-request/formStyles";
import { LocationCascadeSelect, type LocationNodeLite } from "@/components/shared/LocationCascadeSelect";

interface Slot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const EMPTY_SLOT: Slot = { dayOfWeek: "SUN", startTime: "09:00", endTime: "15:00" };

export function SchoolVacancyForm({ provinces }: { provinces: LocationNodeLite[] }) {
  const [institutionName, setInstitutionName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [tutorVisibleLocality, setTutorVisibleLocality] = useState("");
  const [exactAddress, setExactAddress] = useState("");
  const [slots, setSlots] = useState<Slot[]>([EMPTY_SLOT]);
  const [notes, setNotes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [submittedUid, setSubmittedUid] = useState<string | null>(null);

  function updateSlot(index: number, patch: Partial<Slot>) {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!locationId) {
      setError("Select the school's province, district, municipality, and ward.");
      return;
    }

    const formData = new FormData();
    formData.set("institutionName", institutionName);
    formData.set("contactPersonName", contactPersonName);
    formData.set("contactPhone", contactPhone);
    formData.set("contactEmail", contactEmail);
    formData.set("subjectId", subjectId);
    formData.set("gradeId", gradeId);
    formData.set("locationId", locationId);
    formData.set("tutorVisibleLocality", tutorVisibleLocality);
    formData.set("exactAddress", exactAddress);
    formData.set("slotsJson", JSON.stringify(slots));
    formData.set("notes", notes);

    startTransition(async () => {
      const result = await submitSchoolVacancyAsAdmin(formData);
      if (result.ok) {
        setSubmittedUid(result.tuitionUid);
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  if (submittedUid) {
    return (
      <div className={sectionClass}>
        <div className="flex items-center gap-3">
          <MaterialIcon name="check_circle" filled className="text-primary-container text-3xl" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Vacancy posted</h2>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          It&rsquo;s now a New Request ({submittedUid}) — confirm it from there to make it visible to tutors.
        </p>
        <Link href="/admin/tuition-requests/new" className="self-start font-label-md text-label-md text-primary-container">
          View New Requests
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">School</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="institutionName">School / institution name</label>
            <input id="institutionName" className={inputClass} value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} required />
            {fieldErrors.institutionName && <p className={errorTextClass}>{fieldErrors.institutionName}</p>}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="contactPersonName">Contact person</label>
            <input id="contactPersonName" className={inputClass} value={contactPersonName} onChange={(e) => setContactPersonName(e.target.value)} required />
            {fieldErrors.contactPersonName && <p className={errorTextClass}>{fieldErrors.contactPersonName}</p>}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="contactPhone">Contact phone</label>
            <input id="contactPhone" className={inputClass} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
            {fieldErrors.contactPhone && <p className={errorTextClass}>{fieldErrors.contactPhone}</p>}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="contactEmail">Contact email (optional)</label>
            <input id="contactEmail" type="email" className={inputClass} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            {fieldErrors.contactEmail && <p className={errorTextClass}>{fieldErrors.contactEmail}</p>}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Vacancy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="subjectId">Subject</label>
            <select id="subjectId" className={inputClass} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              <option value="" disabled>Select subject</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            {fieldErrors.subjectId && <p className={errorTextClass}>{fieldErrors.subjectId}</p>}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="gradeId">Grade</label>
            <select id="gradeId" className={inputClass} value={gradeId} onChange={(e) => setGradeId(e.target.value)} required>
              <option value="" disabled>Select grade</option>
              {GRADES.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
            {fieldErrors.gradeId && <p className={errorTextClass}>{fieldErrors.gradeId}</p>}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Location</h2>
        <LocationCascadeSelect provinces={provinces} onChange={(id) => setLocationId(id)} />
        {fieldErrors.locationId && <p className={errorTextClass}>{fieldErrors.locationId}</p>}
        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="tutorVisibleLocality">Area / locality</label>
          <input
            id="tutorVisibleLocality"
            className={inputClass}
            value={tutorVisibleLocality}
            onChange={(e) => setTutorVisibleLocality(e.target.value)}
            placeholder="e.g. New Baneshwor"
            required
          />
          {fieldErrors.tutorVisibleLocality && <p className={errorTextClass}>{fieldErrors.tutorVisibleLocality}</p>}
        </div>
        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="exactAddress">Exact address (private)</label>
          <textarea id="exactAddress" className={inputClass} rows={2} value={exactAddress} onChange={(e) => setExactAddress(e.target.value)} required />
          {fieldErrors.exactAddress && <p className={errorTextClass}>{fieldErrors.exactAddress}</p>}
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Availability</h2>
        <div className="flex flex-col gap-3">
          {slots.map((slot, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <select className={`${inputClass} w-auto`} value={slot.dayOfWeek} onChange={(e) => updateSlot(index, { dayOfWeek: e.target.value })}>
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
              <input type="time" className={`${inputClass} w-auto`} value={slot.startTime} onChange={(e) => updateSlot(index, { startTime: e.target.value })} />
              <span className="font-body-sm text-body-sm text-on-surface-variant">to</span>
              <input type="time" className={`${inputClass} w-auto`} value={slot.endTime} onChange={(e) => updateSlot(index, { endTime: e.target.value })} />
              {slots.length > 1 && (
                <button type="button" onClick={() => setSlots((prev) => prev.filter((_, i) => i !== index))} aria-label="Remove slot" className="text-error">
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
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Notes (optional)</h2>
        <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything tutors should know?" />
      </div>

      {error && <p className={errorTextClass}>{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-end bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {pending ? "Posting..." : "Post Vacancy"}
      </button>
    </form>
  );
}
