"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth } from "@/lib/firebase/admin";
import { requireRole, requireSession } from "@/server/auth/guards";
import { branchesCollection, userAccountsCollection } from "@/server/domain/collections";
import { generateSequentialUid } from "@/server/domain/ids";
import { fetchPage, type PageResult } from "@/server/domain/pagination";
import { writeAuditEvent } from "@/server/domain/audit";
import type { Role, BranchCoverage } from "@/server/domain/types";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type CreateAdminResult =
  | { ok: true; email: string; adminUid: string; temporaryPassword: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export interface AdminUserRow {
  id: string;
  adminUid: string | null;
  fullName: string | null;
  email: string | null;
  role: Role;
  branchId: string | null;
  branchName: string | null;
  accountStatus: "ACTIVE" | "DISABLED";
}

/**
 * The Super Admin "Admins" panel: every admin account, optionally
 * filtered by branch. Tutor browsing lives separately at
 * /admin/tutors/all (getAllTutors) since a Branch Admin needs that view
 * too but has no authority over admin accounts.
 */
export async function getUsersOverview(
  branchFilter: string | null,
  cursor: string | null,
): Promise<PageResult<AdminUserRow>> {
  await requireRole(["SUPER_ADMIN"]);

  const branchSnap = await branchesCollection().get();
  const branchNames = new Map(branchSnap.docs.map((d) => [d.id, d.data().name]));

  let base = userAccountsCollection().where("role", "in", ["SUPER_ADMIN", "BRANCH_ADMIN"]);
  if (branchFilter) base = base.where("branchId", "==", branchFilter);
  const page = await fetchPage(base, "createdAt", cursor);
  return {
    ...page,
    items: page.items.map((a) => ({
      id: a.id,
      adminUid: a.adminUid,
      fullName: a.fullName,
      email: a.email,
      role: a.role,
      branchId: a.branchId,
      branchName: a.branchId ? (branchNames.get(a.branchId) ?? null) : null,
      accountStatus: a.accountStatus,
    })),
  };
}

/**
 * Enable/disable an admin account (Super Admin or Branch Admin) — the
 * accountStatus toggle already checked on every request by
 * getCurrentSession(). Tutors have their own richer suspend/reactivate
 * flow (server/actions/suspension.ts) tied to verificationStatus, not
 * this one, since a suspended tutor needs the dedicated /suspended
 * redirect and a recorded reason — this action is admin-accounts only.
 */
export async function setAdminAccountStatus(userId: string, status: "ACTIVE" | "DISABLED"): Promise<ActionResult> {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (userId === session.uid) {
    return { ok: false, error: "You cannot change your own account's status." };
  }

  const targetRef = userAccountsCollection().doc(userId);
  const targetSnap = await targetRef.get();
  if (!targetSnap.exists) return { ok: false, error: "Account not found." };
  const target = targetSnap.data()!;
  if (target.role === "TUTOR") {
    return { ok: false, error: "Use the tutor suspend/reactivate action for tutor accounts." };
  }

  await targetRef.update({ accountStatus: status, updatedAt: FieldValue.serverTimestamp() });

  await writeAuditEvent({
    action: status === "DISABLED" ? "ADMIN_ACCOUNT_DISABLED" : "ADMIN_ACCOUNT_ENABLED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "UserAccount",
    targetId: userId,
    metadata: { targetRole: target.role },
  });

  return { ok: true };
}

const NEW_BRANCH_SENTINEL = "__new__";

const createAdminSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter a full name.").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    role: z.enum(["BRANCH_ADMIN", "SUPER_ADMIN"]),
    branchId: z.string().trim().optional(),
    newBranchName: z.string().trim().max(120).optional(),
    newBranchCity: z.string().trim().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "BRANCH_ADMIN") return;
    if (!data.branchId) {
      ctx.addIssue({ code: "custom", path: ["branchId"], message: "Select the branch this admin will manage." });
      return;
    }
    if (data.branchId === NEW_BRANCH_SENTINEL) {
      if (!data.newBranchName) {
        ctx.addIssue({ code: "custom", path: ["newBranchName"], message: "Enter the new branch's name." });
      }
      if (!data.newBranchCity) {
        ctx.addIssue({ code: "custom", path: ["newBranchCity"], message: "Enter the new branch's city." });
      }
    }
  });

function generateTemporaryPassword(): string {
  // URL-safe, no ambiguous punctuation to read/type over chat — 16 chars is
  // well above Firebase Auth's 6-char minimum.
  return randomBytes(12).toString("base64url").slice(0, 16);
}

/**
 * The Super Admin "Admins" panel's creation flow — the in-app replacement
 * for scripts/provision-admin.ts (PRD AUTH-003 forbids *public* admin
 * registration, not a Super-Admin-gated one; role/permission matrix
 * confirms "Manage Branch Admins" is a Super Admin capability). Creates
 * the Firebase Auth identity and the UserAccount doc together and returns
 * a one-time temporary password — there is no email delivery wired up, so
 * the Super Admin must hand it to the new admin directly.
 */
export async function createAdminAccount(formData: FormData): Promise<CreateAdminResult> {
  const session = await requireRole(["SUPER_ADMIN"]);

  const parsed = createAdminSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role"),
    branchId: formData.get("branchId") || undefined,
    newBranchName: formData.get("newBranchName") || undefined,
    newBranchCity: formData.get("newBranchCity") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  const { fullName, email, role } = parsed.data;

  // Checked before touching the branch so a duplicate email can't leave
  // behind an orphaned newly-created branch with no admin attached.
  const existingAuthUser = await adminAuth.getUserByEmail(email).catch(() => null);
  if (existingAuthUser) {
    return { ok: false, error: "An account with this email already exists.", fieldErrors: { email: "Already in use." } };
  }

  let branchId: string | null = null;
  let newBranchUid: string | null = null;

  if (role === "BRANCH_ADMIN") {
    if (parsed.data.branchId === NEW_BRANCH_SENTINEL) {
      let parsedCoverage: BranchCoverage[] = [];
      const coverageRaw = formData.get("newBranchCoverage");
      if (typeof coverageRaw === "string" && coverageRaw.trim()) {
        try {
          parsedCoverage = JSON.parse(coverageRaw);
        } catch {
          // ignore
        }
      }
      const coverageDistrictIds = Array.from(new Set(parsedCoverage.map((c) => c.districtId)));
      const coverageLocalGovernmentIds = Array.from(
        new Set(parsedCoverage.flatMap((c) => c.localGovernmentIds ?? [])),
      );

      // Mirrors scripts/provision-admin.ts's --branch-name/--branch-city
      // path — this is the in-app equivalent (PRD AUTH-003 forbids
      // *public* admin/branch registration, not a Super-Admin-gated one).
      const branchRef = branchesCollection().doc();
      newBranchUid = await generateSequentialUid("branch");
      const now = FieldValue.serverTimestamp();
      await branchRef.set({
        id: branchRef.id,
        branchUid: newBranchUid,
        name: parsed.data.newBranchName!,
        city: parsed.data.newBranchCity!,
        coverage: parsedCoverage,
        coverageDistrictIds,
        coverageLocalGovernmentIds,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      });
      branchId = branchRef.id;
    } else {
      const branchSnap = await branchesCollection().doc(parsed.data.branchId!).get();
      if (!branchSnap.exists) {
        return { ok: false, error: "Selected branch not found.", fieldErrors: { branchId: "Selected branch not found." } };
      }
      if (branchSnap.data()!.status !== "ACTIVE") {
        return { ok: false, error: "That branch is inactive.", fieldErrors: { branchId: "That branch is inactive." } };
      }
      branchId = branchSnap.id;
    }
  }

  const temporaryPassword = generateTemporaryPassword();
  let authUid: string;
  try {
    const authUser = await adminAuth.createUser({
      email,
      password: temporaryPassword,
      displayName: fullName,
      emailVerified: true,
    });
    authUid = authUser.uid;
  } catch (err) {
    const code = (err as { code?: string }).code;
    const message =
      code === "auth/email-already-exists"
        ? "An account with this email already exists."
        : code === "auth/invalid-email"
          ? "Enter a valid email address."
          : "Could not create the account. Please try again.";
    return { ok: false, error: message };
  }

  const adminUid = await generateSequentialUid("admin");
  const now = FieldValue.serverTimestamp();
  await userAccountsCollection()
    .doc(authUid)
    .set({
      id: authUid,
      authProviderUid: authUid,
      email,
      role,
      branchId,
      accountStatus: "ACTIVE",
      fullName,
      adminUid,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });

  await writeAuditEvent({
    action: "ADMIN_ACCOUNT_CREATED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "UserAccount",
    targetId: authUid,
    metadata: { role, branchId, adminUid, ...(newBranchUid ? { newBranchUid } : {}) },
  });

  return { ok: true, email, adminUid, temporaryPassword };
}

/**
 * Clears the caller's own mustChangePassword flag, once they've actually
 * changed it (see /admin/change-password-required). Session-derived —
 * never trusts a client-supplied target id, since that would let anyone
 * clear anyone else's flag.
 */
export async function clearMustChangePasswordFlag(): Promise<ActionResult> {
  const session = await requireSession();
  await userAccountsCollection().doc(session.uid).update({
    mustChangePassword: false,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { ok: true };
}
