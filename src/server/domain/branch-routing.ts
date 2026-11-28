import { branchesCollection, geographicLocationsCollection } from "./collections";
import { getLocationAncestry } from "@/server/queries/location-hierarchy";
import type { BranchCoverage } from "./types";

/**
 * Checks if `coverage` overlaps with any other active branch's configured
 * district/municipality coverage. Returns the conflicting branch name if found.
 */
export async function findOverlappingBranchCoverage(
  coverage: BranchCoverage[],
  excludeBranchId?: string,
): Promise<{ branchName: string; districtName: string } | null> {
  if (coverage.length === 0) return null;
  const branchSnap = await branchesCollection().where("status", "==", "ACTIVE").get();

  for (const doc of branchSnap.docs) {
    if (excludeBranchId && doc.id === excludeBranchId) continue;
    const other = doc.data();
    if (!other.coverage || other.coverage.length === 0) continue;

    for (const incoming of coverage) {
      const existing = other.coverage.find((c) => c.districtId === incoming.districtId);
      if (!existing) continue;

      const incomingEntire = !incoming.localGovernmentIds || incoming.localGovernmentIds.length === 0;
      const existingEntire = !existing.localGovernmentIds || existing.localGovernmentIds.length === 0;
      if (incomingEntire || existingEntire) {
        return { branchName: other.name, districtName: incoming.districtName ?? incoming.districtId };
      }
      const existingSet = new Set(existing.localGovernmentIds);
      if (incoming.localGovernmentIds!.some((id) => existingSet.has(id))) {
        return { branchName: other.name, districtName: incoming.districtName ?? incoming.districtId };
      }
    }
  }
  return null;
}

/**
 * Resolves which Branch a location belongs to.
 *
 * Routing precedence:
 * 1. Structured Branch Coverage (District + optional Municipality list):
 *    - Matches if the location's parent district is listed in `branch.coverage`:
 *      - If specific `localGovernmentIds` are defined: matches ONLY if the
 *        location's Local Government ID is in that list.
 *      - If NO `localGovernmentIds` are defined (or empty): matches the ENTIRE district!
 * 2. Legacy Fallback (for branches configured only with a free-text city):
 *    - Matches the covering Local Government's name against `Branch.city` via exact or
 *      case-insensitive substring match.
 *
 * Returns null (unrouted, Super-Admin-only visibility) when no active branch matches.
 */
export async function resolveBranchIdForLocation(locationId: string): Promise<string | null> {
  const locationSnap = await geographicLocationsCollection().doc(locationId).get();
  if (!locationSnap.exists) return null;
  const location = locationSnap.data()!;

  let localGovernmentId: string | null = null;
  let localGovernmentName: string | null = null;
  let localGovernmentNameEnglish: string | null = null;
  let districtId: string | null = null;

  if (location.level === "CITY") {
    // M3-era provisional record — match directly (see location-seed-data.ts).
    localGovernmentName = location.name;
  } else if (location.level === "WARD") {
    const ancestry = await getLocationAncestry(locationId);
    const localGov = ancestry.find((l) => l.level === "LOCAL_GOVERNMENT");
    const dist = ancestry.find((l) => l.level === "DISTRICT");
    if (!localGov) return null;
    localGovernmentId = localGov.id;
    localGovernmentName = localGov.name;
    localGovernmentNameEnglish = localGov.nameEnglish;
    if (dist) districtId = dist.id;
  } else if (location.level === "LOCAL_GOVERNMENT") {
    localGovernmentId = location.id;
    localGovernmentName = location.name;
    localGovernmentNameEnglish = location.nameEnglish;
    districtId = location.parentLocationId;
  } else {
    return null; // PROVINCE/DISTRICT are too coarse to route to a single branch.
  }

  const branchSnap = await branchesCollection().where("status", "==", "ACTIVE").get();
  const activeBranches = branchSnap.docs.map((d) => d.data());

  // Pass 1: Structured coverage matching
  for (const branch of activeBranches) {
    if (branch.coverage && branch.coverage.length > 0) {
      if (districtId) {
        const distCoverage = branch.coverage.find((c) => c.districtId === districtId);
        if (distCoverage) {
          if (distCoverage.localGovernmentIds && distCoverage.localGovernmentIds.length > 0) {
            if (localGovernmentId && distCoverage.localGovernmentIds.includes(localGovernmentId)) {
              return branch.id;
            }
            // In this district, but this branch only covers other specific municipalities.
            continue;
          }
          // No specific municipalities specified => ENTIRE district covered!
          return branch.id;
        }
      }

      // Direct municipality coverage list fallback
      if (localGovernmentId && branch.coverageLocalGovernmentIds?.includes(localGovernmentId)) {
        return branch.id;
      }
    }
  }

  // Pass 2: Legacy fallback for branches without structured coverage
  const candidates = [localGovernmentName, localGovernmentNameEnglish].filter(
    (v): v is string => Boolean(v),
  );

  for (const branch of activeBranches) {
    if (!branch.coverage || branch.coverage.length === 0) {
      const city = branch.city.trim().toLowerCase();
      const isMatch = candidates.some((name) => {
        const n = name.trim().toLowerCase();
        return n === city || n.includes(city) || city.includes(n);
      });
      if (isMatch) return branch.id;
    }
  }

  return null;
}
