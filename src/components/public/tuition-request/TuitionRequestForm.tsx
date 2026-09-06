"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { GRADES } from "@/lib/catalog";
import { submitTuitionRequest, type ActionResult } from "@/server/actions/parent-request";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { errorTextClass, fieldWrapClass, inputClass, labelClass, sectionClass } from "./formStyles";
import { LocationCascadeSelect, type LocationNodeLite } from "@/components/shared/LocationCascadeSelect";
import { DayRangeAvailabilityPicker, type AvailabilitySlotState } from "@/components/shared/DayRangeAvailabilityPicker";
import { SubjectMultiSelect } from "@/components/shared/SubjectMultiSelect";

interface StudentBlock {
  studentFullName: string;
  gradeId: string;
  schoolName: string;
  subjectIds: string[];
  currentProgram: string;
  currentYearOrSemester: string;
}

function emptyStudentBlock(gradeId: string, subjectId: string): StudentBlock {
  return {
    studentFullName: "",
    gradeId,
    schoolName: "",
    subjectIds: subjectId ? [subjectId] : [],
    currentProgram: "",
    currentYearOrSemester: "",
  };
}

const GENDER_OPTIONS: { id: "ANY" | "MALE" | "FEMALE"; label: string }[] = [
  { id: "ANY", label: "No preference" },
  { id: "MALE", label: "Male tutor" },
  { id: "FEMALE", label: "Female tutor" },
];

export function TuitionRequestForm({
  provinces,
  initialGradeId,
  initialSubjectId,
  action = submitTuitionRequest,
  successHref = "/",
  successHrefLabel = "Back to home",
}: {
  provinces: LocationNodeLite[];
  initialGradeId: string;
  initialSubjectId: string;
  /** Defaults to the public submission action — pass the admin-intake action for internal use. */
  action?: (formData: FormData) => Promise<ActionResult>;
  successHref?: string;
  successHrefLabel?: string;
}) {
  const [parentFullName, setParentFullName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [students, setStudents] = useState<StudentBlock[]>([emptyStudentBlock(initialGradeId, initialSubjectId)]);
  const [tutorGenderPreference, setTutorGenderPreference] = useState<"ANY" | "MALE" | "FEMALE">("ANY");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [tutorVisibleLocality, setTutorVisibleLocality] = useState("");
  const [exactAddress, setExactAddress] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlotState[]>([{ dayOfWeek: "SUN", startTime: "17:00", endTime: "19:00" }]);
  const [notes, setNotes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [submittedUids, setSubmittedUids] = useState<string[] | null>(null);

  function updateStudent(index: number, patch: Partial<StudentBlock>) {
    setStudents((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addStudent() {
    setStudents((prev) => [...prev, emptyStudentBlock("", "")]);
  }

  function removeStudent(index: number) {
    setStudents((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!locationId) {
      setError("Select your province, district, municipality, and ward.");
      return;
    }
    if (students.some((s) => s.subjectIds.length === 0)) {
      setError("Add at least one subject for each student.");
      return;
    }

    const formData = new FormData();
    formData.set("parentFullName", parentFullName);
    formData.set("parentPhone", parentPhone);
    formData.set("parentEmail", parentEmail);
    formData.set(
      "studentsJson",
      JSON.stringify(
        students.map((s) => ({
          studentFullName: s.studentFullName,
          gradeId: s.gradeId,
          schoolName: s.schoolName || null,
          subjectIds: s.subjectIds,
          currentProgram: s.gradeId === "bachelor-level" ? s.currentProgram || null : null,
          currentYearOrSemester: s.gradeId === "bachelor-level" ? s.currentYearOrSemester || null : null,
        })),
      ),
    );
    formData.set("tutorGenderPreference", tutorGenderPreference);
    formData.set("locationId", locationId);
    formData.set("tutorVisibleLocality", tutorVisibleLocality);
    formData.set("exactAddress", exactAddress);
    formData.set("slotsJson", JSON.stringify(slots));
    formData.set("notes", notes);

    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        setSubmittedUids(result.tuitionUids);
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  if (submittedUids) {
    return (
      <div className={sectionClass}>
        <div className="flex items-center gap-3">
          <MaterialIcon name="check_circle" filled className="text-primary-container text-3xl" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Request received</h2>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Thank you — your requirement{submittedUids.length > 1 ? "s have" : " has"} been received and will be
          reviewed by our team. We didn&rsquo;t create an account for you; if you need to follow up, just
          reference {submittedUids.length > 1 ? "these IDs" : "this ID"}:{" "}
          <strong>{submittedUids.join(", ")}</strong>.
        </p>
        <Link href={successHref} className="self-start font-label-md text-label-md text-primary-container">
          {successHrefLabel}
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
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Student{students.length > 1 ? "s" : ""}</h2>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
          Have more than one child who needs a tutor? Add each one below — we&rsquo;ll treat them as separate
          requests sharing your contact details and location.
        </p>

        {students.map((student, index) => (
          <div key={index} className="border border-outline-variant rounded-xl p-lg flex flex-col gap-4">
            {students.length > 1 && (
              <div className="flex items-center justify-between">
                <p className="font-label-md text-label-md text-on-surface-variant">Student {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeStudent(index)}
                  aria-label="Remove student"
                  className="text-error flex items-center gap-1 font-label-md text-label-md"
                >
                  <MaterialIcon name="close" /> Remove
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={fieldWrapClass}>
                <label className={labelClass} htmlFor={`studentFullName-${index}`}>Student name</label>
                <input
                  id={`studentFullName-${index}`}
                  className={inputClass}
                  value={student.studentFullName}
                  onChange={(e) => updateStudent(index, { studentFullName: e.target.value })}
                  required
                />
                {fieldErrors[`students.${index}.studentFullName`] && (
                  <p className={errorTextClass}>{fieldErrors[`students.${index}.studentFullName`]}</p>
                )}
              </div>
              <div className={fieldWrapClass}>
                <label className={labelClass} htmlFor={`gradeId-${index}`}>Grade</label>
                <select
                  id={`gradeId-${index}`}
                  className={inputClass}
                  value={student.gradeId}
                  onChange={(e) => updateStudent(index, { gradeId: e.target.value })}
                  required
                >
                  <option value="" disabled>Select grade</option>
                  {GRADES.map((g) => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className={fieldWrapClass}>
                <label className={labelClass} htmlFor={`schoolName-${index}`}>School (optional)</label>
                <input
                  id={`schoolName-${index}`}
                  className={inputClass}
                  value={student.schoolName}
                  onChange={(e) => updateStudent(index, { schoolName: e.target.value })}
                />
              </div>
            </div>
            <div className={fieldWrapClass}>
              <label className={labelClass} htmlFor={`subjectIds-${index}`}>Subjects</label>
              <SubjectMultiSelect
                id={`subjectIds-${index}`}
                value={student.subjectIds}
                onChange={(subjectIds) => updateStudent(index, { subjectIds })}
                placeholder="Type or pick a subject..."
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Add as many as needed — don&rsquo;t see the right one? Type it and add it as-is.
              </p>
              {fieldErrors[`students.${index}.subjectIds`] && (
                <p className={errorTextClass}>{fieldErrors[`students.${index}.subjectIds`]}</p>
              )}
            </div>

            {student.gradeId === "bachelor-level" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={fieldWrapClass}>
                  <label className={labelClass} htmlFor={`currentProgram-${index}`}>Current course / program (optional)</label>
                  <input
                    id={`currentProgram-${index}`}
                    className={inputClass}
                    placeholder="e.g. BSc Computer Science"
                    value={student.currentProgram}
                    onChange={(e) => updateStudent(index, { currentProgram: e.target.value })}
                  />
                </div>
                <div className={fieldWrapClass}>
                  <label className={labelClass} htmlFor={`currentYearOrSemester-${index}`}>Current year / semester (optional)</label>
                  <input
                    id={`currentYearOrSemester-${index}`}
                    className={inputClass}
                    placeholder="e.g. 4th semester"
                    value={student.currentYearOrSemester}
                    onChange={(e) => updateStudent(index, { currentYearOrSemester: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addStudent}
          className="self-start font-label-md text-label-md text-primary-container flex items-center gap-1"
        >
          <MaterialIcon name="add" /> Add Student
        </button>
        {fieldErrors.students && <p className={errorTextClass}>{fieldErrors.students}</p>}
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Tutor Preference</h2>
        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="tutorGenderPreference">Tutor gender</label>
          <select
            id="tutorGenderPreference"
            className={inputClass}
            value={tutorGenderPreference}
            onChange={(e) => setTutorGenderPreference(e.target.value as "ANY" | "MALE" | "FEMALE")}
          >
            {GENDER_OPTIONS.map((g) => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Location</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
          Your exact address is kept private and only shared with our admin team — tutors only
          ever see the area/locality below.
        </p>
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
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No official directory of neighborhood names exists below ward level — enter the area
            name tutors would recognize.
          </p>
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
        <DayRangeAvailabilityPicker slots={slots} onChange={setSlots} />
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
