"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { submitContactQuery } from "@/server/actions/contact";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  errorTextClass,
  fieldWrapClass,
  inputClass,
  labelClass,
  sectionClass,
} from "@/components/public/tuition-request/formStyles";

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
    formData.set("fullName", fullName);
    formData.set("email", email);
    formData.set("phone", phone);
    formData.set("message", message);

    startTransition(async () => {
      const result = await submitContactQuery(formData);
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
          <h2 className="font-headline-md text-headline-md text-on-surface">Message sent</h2>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Thanks for reaching out — our team will get back to you by email or phone. If you need to reference
          this later, your enquiry ID is <strong>{submittedUid}</strong>.
        </p>
        <Link href="/" className="self-start font-label-md text-label-md text-primary-container">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={sectionClass}>
      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          className={inputClass}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        {fieldErrors.fullName && <p className={errorTextClass}>{fieldErrors.fullName}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {fieldErrors.email && <p className={errorTextClass}>{fieldErrors.email}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="phone">Phone (optional)</label>
        <input id="phone" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
        {fieldErrors.phone && <p className={errorTextClass}>{fieldErrors.phone}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="message">Message</label>
        <textarea
          id="message"
          className={inputClass}
          rows={5}
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
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
