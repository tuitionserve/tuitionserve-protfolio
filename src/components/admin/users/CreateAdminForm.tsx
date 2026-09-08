"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createAdminAccount } from "@/server/actions/admin-users";
import type { LocationNode } from "@/server/queries/location-hierarchy";
import type { BranchCoverage } from "@/server/domain/types";
import { BranchCoveragePicker } from "@/components/admin/branches/BranchCoveragePicker";

const inputClass =
  "border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full";
const labelClass = "font-label-md text-label-md text-on-surface-variant";
const fieldWrapClass = "flex flex-col gap-2";
const errorTextClass = "font-body-sm text-body-sm text-error mt-1";
const NEW_BRANCH_SENTINEL = "__new__";

export function CreateAdminForm({
  branches,
  districts = [],
}: {
  branches: { id: string; name: string }[];
  districts?: LocationNode[];
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"BRANCH_ADMIN" | "SUPER_ADMIN">("BRANCH_ADMIN");
  const [branchId, setBranchId] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCity, setNewBranchCity] = useState("");
  const [coverage, setCoverage] = useState<BranchCoverage[]>([]);
  const isNewBranch = branchId === NEW_BRANCH_SENTINEL;
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [created, setCreated] = useState<{ email: string; adminUid: string; temporaryPassword: string } | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("email", email);
    formData.set("role", role);
    if (role === "BRANCH_ADMIN") {
      formData.set("branchId", branchId);
      if (isNewBranch) {
        formData.set("newBranchName", newBranchName);
        formData.set("newBranchCity", newBranchCity);
        formData.set("newBranchCoverage", JSON.stringify(coverage));
      }
    }

    startTransition(async () => {
      const result = await createAdminAccount(formData);
      if (result.ok) {
        setCreated(result);
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  if (created) {
    return (
      <div className="bg-primary-container/10 border border-primary-container rounded-xl p-lg flex flex-col gap-4">
        <div>
          <p className="font-label-md text-label-md text-on-surface">Admin account created.</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Share these sign-in details with them directly — this temporary password is shown only once and
            can&rsquo;t be retrieved again.
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-4 flex flex-col gap-2">
          <div className="flex justify-between gap-4">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Admin UID</span>
            <span className="font-label-md text-label-md text-on-surface">{created.adminUid}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Email</span>
            <span className="font-label-md text-label-md text-on-surface">{created.email}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Temporary password</span>
            <span className="font-label-md text-label-md text-on-surface font-mono">{created.temporaryPassword}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/admins")}
            className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all"
          >
            Back to Admins
          </button>
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setFullName("");
              setEmail("");
              setBranchId("");
              setNewBranchName("");
              setNewBranchCity("");
              setCoverage([]);
            }}
            className="border border-secondary text-secondary font-label-md text-label-md rounded-lg px-6 py-3 hover:bg-surface-container transition-all"
          >
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-[36rem]">
      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="fullName">Full name</label>
        <input id="fullName" className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        {fieldErrors.fullName && <p className={errorTextClass}>{fieldErrors.fullName}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
        {fieldErrors.email && <p className={errorTextClass}>{fieldErrors.email}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="role">Role</label>
        <select
          id="role"
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value as "BRANCH_ADMIN" | "SUPER_ADMIN")}
        >
          <option value="BRANCH_ADMIN">Branch Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        {fieldErrors.role && <p className={errorTextClass}>{fieldErrors.role}</p>}
      </div>

      {role === "BRANCH_ADMIN" && (
        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="branchId">Branch</label>
          <select
            id="branchId"
            className={inputClass}
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            required
          >
            <option value="" disabled>Select the branch they&rsquo;ll manage</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
            <option value={NEW_BRANCH_SENTINEL}>+ Create a new branch...</option>
          </select>
          {fieldErrors.branchId && <p className={errorTextClass}>{fieldErrors.branchId}</p>}
        </div>
      )}

      {role === "BRANCH_ADMIN" && isNewBranch && (
        <div className="flex flex-col gap-4 border border-outline-variant/60 rounded-xl p-4 bg-surface-container-low">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={fieldWrapClass}>
              <label className={labelClass} htmlFor="newBranchName">New branch name</label>
              <input
                id="newBranchName"
                className={inputClass}
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="e.g. Pokhara Branch"
                required
              />
              {fieldErrors.newBranchName && <p className={errorTextClass}>{fieldErrors.newBranchName}</p>}
            </div>
            <div className={fieldWrapClass}>
              <label className={labelClass} htmlFor="newBranchCity">City / Headquarters</label>
              <input
                id="newBranchCity"
                className={inputClass}
                value={newBranchCity}
                onChange={(e) => setNewBranchCity(e.target.value)}
                placeholder="e.g. Pokhara"
                required
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Used for branch display and fallback location matching.
              </p>
              {fieldErrors.newBranchCity && <p className={errorTextClass}>{fieldErrors.newBranchCity}</p>}
            </div>
          </div>

          <div className="border-t border-surface-variant pt-3">
            <BranchCoveragePicker
              districts={districts}
              value={coverage}
              onChange={setCoverage}
            />
          </div>
        </div>
      )}

      {error && <p className={errorTextClass}>{error}</p>}

      <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1">
        No password field needed — a secure temporary password is generated automatically and shown once you
        submit, so you can hand it to them directly.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create Admin"}
      </button>
    </form>
  );
}
