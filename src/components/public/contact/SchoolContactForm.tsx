"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { submitSchoolContactQuery, type ActionResult } from "@/server/actions/school-contact";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  errorTextClass,
  fieldWrapClass,
  inputClass,
  labelClass,
  sectionClass,
} from "@/components/public/tuition-request/formStyles";

export function SchoolContactForm({
  action = submitSchoolContactQuery,
  successHref = "/",
  successHrefLabel = "Back to home",
}: {
  /** Defaults to the public submission action — pass the admin-intake action for internal use. */
  action?: (formData: FormData) => Promise<ActionResult>;
  successHref?: string;
  successHrefLabel?: string;
} = {}) {
  const [institutionName, setInstitutionName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [submittedUid, setSubmittedUid] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.set("institutionName", institutionName);
    formData.set("contactPersonName", contactPersonName);
    formData.set("email", email);
    formData.set("phone", phone);
    formData.set("location", location);
    formData.set("message", message);

    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        setSubmittedUid(result.queryUid);
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
          <h2 className="font-headline-md text-headline-md text-on-surface">Enquiry sent</h2>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Thanks for reaching out — our partnerships team will get back to you. If you need to reference this
          later, your enquiry ID is <strong>{submittedUid}</strong>.
        </p>
        <Link href={successHref} className="self-start font-label-md text-label-md text-primary-container">
          {successHrefLabel}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={sectionClass}>
      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="institutionName">School / institution name</label>
        <input
          id="institutionName"
          className={inputClass}
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          required
        />
        {fieldErrors.institutionName && <p className={errorTextClass}>{fieldErrors.institutionName}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="contactPersonName">Contact person</label>
        <input
          id="contactPersonName"
          className={inputClass}
          value={contactPersonName}
          onChange={(e) => setContactPersonName(e.target.value)}
          required
        />
        {fieldErrors.contactPersonName && <p className={errorTextClass}>{fieldErrors.contactPersonName}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="phone">Phone</label>
        <input id="phone" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        {fieldErrors.phone && <p className={errorTextClass}>{fieldErrors.phone}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="email">Email (optional)</label>
        <input
          id="email"
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {fieldErrors.email && <p className={errorTextClass}>{fieldErrors.email}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="location">Location / area</label>
        <input
          id="location"
          className={inputClass}
          placeholder="e.g. New Baneshwor, Kathmandu"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        {fieldErrors.location && <p className={errorTextClass}>{fieldErrors.location}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="message">What are you looking for?</label>
        <textarea
          id="message"
          className={inputClass}
          rows={5}
          placeholder="e.g. Subjects, number of teachers, grade levels, timeline..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        {fieldErrors.message && <p className={errorTextClass}>{fieldErrors.message}</p>}
      </div>

      {error && <p className={errorTextClass}>{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send Enquiry"}
      </button>
    </form>
  );
}
