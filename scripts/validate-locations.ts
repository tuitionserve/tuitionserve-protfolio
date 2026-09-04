/**
 * Validates the imported location hierarchy directly in Firestore:
 * counts, duplicate IDs, orphaned/invalid parent references, and a spot
 * check of the Devichowk/Janakpur use case. Run after `pnpm
 * import-locations`. Exits non-zero on any failure.
 *
 * Usage: pnpm validate-locations
 */
import { geographicLocationsCollection } from "../src/server/domain/collections";
import type { GeographicLocation } from "../src/server/domain/types";

let failures = 0;
function check(condition: boolean, message: string) {
  if (condition) {
    console.log(`  OK  ${message}`);
  } else {
    console.error(`FAIL  ${message}`);
    failures++;
  }
}

async function main() {
  const snap = await geographicLocationsCollection().get();
  const all = snap.docs.map((d) => d.data());
  const byId = new Map(all.map((l) => [l.id, l]));

  const provinces = all.filter((l) => l.level === "PROVINCE");
  const districts = all.filter((l) => l.level === "DISTRICT");
  const localGovernments = all.filter((l) => l.level === "LOCAL_GOVERNMENT");
  const wards = all.filter((l) => l.level === "WARD");
  const legacyCities = all.filter((l) => l.level === "CITY");

  console.log(`Total documents: ${all.length}`);
  console.log(
    `  PROVINCE=${provinces.length} DISTRICT=${districts.length} LOCAL_GOVERNMENT=${localGovernments.length} ` +
      `WARD=${wards.length} (legacy CITY=${legacyCities.length})\n`,
  );

  console.log("Hierarchy totals:");
  check(provinces.length === 7, `7 provinces (found ${provinces.length})`);
  check(districts.length === 77, `77 districts (found ${districts.length})`);
  check(localGovernments.length === 753, `753 local governments (found ${localGovernments.length})`);
  check(wards.length === 6743, `6,743 wards (found ${wards.length})`);

  console.log("\nDuplicate IDs:");
  check(byId.size === all.length, `no duplicate document IDs (${all.length} docs, ${byId.size} unique)`);

  console.log("\nParent-chain integrity:");
  const invalidDistrictParents = districts.filter((d) => !d.parentLocationId || byId.get(d.parentLocationId)?.level !== "PROVINCE");
  check(invalidDistrictParents.length === 0, `every district's parent is a real province (${invalidDistrictParents.length} invalid)`);

  const invalidLgParents = localGovernments.filter((l) => !l.parentLocationId || byId.get(l.parentLocationId)?.level !== "DISTRICT");
  check(invalidLgParents.length === 0, `every local government's parent is a real district (${invalidLgParents.length} invalid)`);

  const invalidWardParents = wards.filter((w) => !w.parentLocationId || byId.get(w.parentLocationId)?.level !== "LOCAL_GOVERNMENT");
  check(invalidWardParents.length === 0, `every ward's parent is a real local government (${invalidWardParents.length} invalid)`);

  console.log("\nOrphan check (no local government references a nonexistent district, etc. — same as above, plus reverse):");
  const districtIdsWithChildren = new Set(localGovernments.map((l) => l.parentLocationId));
  const districtsWithNoLocalGovernment = districts.filter((d) => !districtIdsWithChildren.has(d.id));
  check(districtsWithNoLocalGovernment.length === 0, `every district has at least one local government (${districtsWithNoLocalGovernment.length} without)`);

  console.log("\nWard counts and postal codes:");
  const wardCountByLg = new Map<string, number>();
  for (const w of wards) {
    wardCountByLg.set(w.parentLocationId!, (wardCountByLg.get(w.parentLocationId!) ?? 0) + 1);
  }
  const mismatchedWardCounts = localGovernments.filter((l) => (wardCountByLg.get(l.id) ?? 0) !== l.wardCount);
  check(mismatchedWardCounts.length === 0, `every local government's actual ward count matches its declared wardCount (${mismatchedWardCounts.length} mismatched)`);

  const postalCodes = wards.map((w) => w.postalCode).filter(Boolean);
  check(new Set(postalCodes).size === postalCodes.length, `all postal codes unique (${postalCodes.length} total)`);
  check(wards.every((w) => w.postalCode !== null), "no ward is missing a postal code");

  console.log("\nEnglish name coverage (informational, not a failure — see SOURCES.md):");
  const provincesWithEn = provinces.filter((p) => p.nameEnglish).length;
  const districtsWithEn = districts.filter((d) => d.nameEnglish).length;
  const lgWithEn = localGovernments.filter((l) => l.nameEnglish).length;
  console.log(`  provinces: ${provincesWithEn}/${provinces.length}`);
  console.log(`  districts: ${districtsWithEn}/${districts.length}`);
  console.log(`  local governments: ${lgWithEn}/${localGovernments.length}`);

  console.log("\nDevichowk/Janakpur use case:");
  const janakpurdham = localGovernments.find((l) => l.nameEnglish === "Janakpurdham");
  check(Boolean(janakpurdham), "Janakpurdham local government found");
  if (janakpurdham) {
    const code = janakpurdham.id.replace("lg-", "");
    const ward9: GeographicLocation | undefined = byId.get(`ward-${code}-09`);
    check(Boolean(ward9), `Ward 9 of Janakpurdham exists (ward-${code}-09) — matches OSM's "Janakpur-09" tag for Devichowk`);
    check(ward9?.postalCode === `${code}09`, "Ward 9's postal code matches expected derivation");
  }

  console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) FAILED.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
