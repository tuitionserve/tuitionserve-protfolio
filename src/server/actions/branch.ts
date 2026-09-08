"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { requireRole } from "@/server/auth/guards";
import { branchesCollection } from "@/server/domain/collections";
import { writeAuditEvent } from "@/server/domain/audit";
import type { BranchCoverage } from "@/server/domain/types";

export type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

const branchCoverageItemSchema = z.object({
  districtId: z.string().trim().min(1, "District ID is required."),
  districtName: z.string().trim().optional(),
  localGovernmentIds: z.array(z.string().trim()).optional(),
});

const updateBranchCoverageSchema = z.object({
  branchId: z.string().trim().min(1, "Branch ID is required."),
  name: z.string().trim().min(2, "Enter a branch name.").max(120),
  city: z.string().trim().min(2, "Enter a branch city / headquarters.").max(120),
  coverage: z.array(branchCoverageItemSchema),
});

export async function updateBranchCoverage(formData: FormData): Promise<ActionResult> {
  const session = await requireRole(["SUPER_ADMIN"]);

  let coverageData: unknown = [];
  const rawCoverage = formData.get("coverage");
  if (typeof rawCoverage === "string" && rawCoverage.trim()) {
    try {
      coverageData = JSON.parse(rawCoverage);
    } catch {
      return { ok: false, error: "Invalid coverage data format." };
    }
  }

  const parsed = updateBranchCoverageSchema.safeParse({
    branchId: formData.get("branchId"),
    name: formData.get("name"),
    city: formData.get("city"),
    coverage: coverageData,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { branchId, name, city, coverage } = parsed.data;

  const branchRef = branchesCollection().doc(branchId);
  const branchSnap = await branchRef.get();
  if (!branchSnap.exists) {
    return { ok: false, error: "Branch not found." };
  }

  const typedCoverage = coverage as BranchCoverage[];
  const coverageDistrictIds = Array.from(new Set(typedCoverage.map((c) => c.districtId)));
  const coverageLocalGovernmentIds = Array.from(
    new Set(typedCoverage.flatMap((c) => c.localGovernmentIds ?? [])),
  );

  const now = FieldValue.serverTimestamp();
  await branchRef.update({
    name,
    city,
    coverage: typedCoverage,
    coverageDistrictIds,
    coverageLocalGovernmentIds,
    updatedAt: now,
  });

  await writeAuditEvent({
    action: "BRANCH_COVERAGE_UPDATED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "Branch",
    targetId: branchId,
    metadata: {
      name,
      city,
      districtCount: coverageDistrictIds.length,
      specificMunicipalitiesCount: coverageLocalGovernmentIds.length,
    },
  });

  revalidatePath("/admin/branches");
  revalidatePath(`/admin/branches/${branchId}`);

  return { ok: true };
}

export async function setBranchStatus(branchId: string, status: "ACTIVE" | "INACTIVE"): Promise<ActionResult> {
  const session = await requireRole(["SUPER_ADMIN"]);

  const branchRef = branchesCollection().doc(branchId);
  const branchSnap = await branchRef.get();
  if (!branchSnap.exists) {
    return { ok: false, error: "Branch not found." };
  }

  await branchRef.update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditEvent({
    action: status === "ACTIVE" ? "BRANCH_ACTIVATED" : "BRANCH_DEACTIVATED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "Branch",
    targetId: branchId,
    metadata: { status },
  });

  revalidatePath("/admin/branches");
  revalidatePath(`/admin/branches/${branchId}`);

  return { ok: true };
}
