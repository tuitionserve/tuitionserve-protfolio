"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { DAYS_OF_WEEK, GRADES, SUBJECTS } from "@/lib/catalog";
import { submitTuitionRequest } from "@/server/actions/parent-request";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { errorTextClass, fieldWrapClass, inputClass, labelClass, sectionClass } from "./formStyles";
import type { LocationOption } from "@/server/queries/locations";

interface Slot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const EMPTY_SLOT: Slot = { dayOfWeek: "SUN", startTime: "17:00", endTime: "19:00" };

export function TuitionRequestForm({
  locationOptions,
  initialGradeId,
  initialSubjectId,
  initialLocationId,
}: {
  locationOptions: LocationOption[];
  initialGradeId: string;
  initialSubjectId: string;
  initialLocationId: string;
}) {
  const [parentFullName, setParentFullName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [studentFullName, setStudentFullName] = useState("");
  const [gradeId, setGradeId] = useState(initialGradeId);
  const [schoolName, setSchoolName] = useState("");
  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [locationId, setLocationId] = useState(
    locationOptions.some((l) => l.id === initialLocationId) ? initialLocationId : "",
  );
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

    const formData = new FormData();
    formData.set("parentFullName", parentFullName);
    formData.set("parentPhone", parentPhone);
    formData.set("parentEmail", parentEmail);
    formData.set("studentFullName", studentFullName);
    formData.set("gradeId", gradeId);
    formData.set("schoolName", schoolName);
    formData.set("subjectId", subjectId);
    formData.set("locationId", locationId);
    formData.set("tutorVisibleLocality", tutorVisibleLocality);
    formData.set("exactAddress", exactAddress);
    formData.set("slotsJson", JSON.stringify(slots));
    formData.set("notes", notes);

    startTransition(async () => {
      const result = await submitTuitionRequest(formData);
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
          <h2 className="font-headline-md text-headline-md text-on-surface">Request received</h2>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Thank you — your requirement has been received and will be reviewed by our team. We
          didn&rsquo;t create an account for you; if you need to follow up, just reference{" "}
          <strong>{submittedUid}</strong>.
        </p>
        <Link href="/" className="self-start font-label-md text-label-md text-primary-container">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Parent</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="parentFullName">Full name</label>
            <input id="parentFullName" className={inputClass} value={parentFullName} onChange={(e) => setParentFullName(e.target.value)} required />
            {fieldErrors.parentFullName && <p className={errorTextClass}>{fieldErrors.parentFullName}</p>}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="parentPhone">Phone</label>
            <input id="parentPhone" className={inputClass} value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} required />
            {fieldErrors.parentPhone && <p className={errorTextClass}>{fieldErrors.parentPhone}</p>}
          </div>
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="parentEmail">Email (optional)</label>
            <input id="parentEmail" type="email" className={inputClass} value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
            {fieldErrors.parentEmail && <p className={errorTextClass}>{fieldErrors.parentEmail}</p>}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Student</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="studentFullName">Student name</label>
            <input id="studentFullName" className={inputClass} value={studentFullName} onChange={(e) => setStudentFullName(e.target.value)} required />
            {fieldErrors.studentFullName && <p className={errorTextClass}>{fieldErrors.studentFullName}</p>}
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
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="schoolName">School (optional)</label>
            <input id="schoolName" className={inputClass} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Tuition</h2>
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
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Location</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
          Your exact address is kept private and only shared with our admin team — tutors only
          ever see the area/locality below.
        </p>
        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="locationId">City</label>
          <select id="locationId" className={inputClass} value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
            <option value="" disabled>Select city</option>
            {locationOptions.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
                {loc.provinceName ? ` (${loc.provinceName})` : ""}
              </option>
            ))}
          </select>
          {fieldErrors.locationId && <p className={errorTextClass}>{fieldErrors.locationId}</p>}
        </div>
        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="tutorVisibleLocality">Area / locality</label>
          <input
            id="tutorVisibleLocality"
            className={inputClass}
            value={tutorVisibleLocality}
            onChange={(e) => setTutorVisibleLocality(e.target.value)}
            placeholder="e.g. Devichowk"
            required
          />
          {fieldErrors.tutorVisibleLocality && <p className={errorTextClass}>{fieldErrors.tutorVisibleLocality}</p>}
        </div>
        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="exactAddress">Exact address (private)</label>
          <textarea
            id="exactAddress"
            className={inputClass}
            rows={2}
            value={exactAddress}
            onChange={(e) => setExactAddress(e.target.value)}
            required
          />
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
        <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else we should know?" />
      </div>

      {error && <p className={errorTextClass}>{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-end bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
