import { requireActiveTutor } from "@/server/auth/guards";
import { getOpenOpportunities } from "@/server/queries/opportunities";
import { tutorProfilesCollection } from "@/server/domain/collections";
import {
  getDistrictsForProvince,
  getLocalGovernmentsForDistrict,
  getLocationAncestry,
  getProvinces,
} from "@/server/queries/location-hierarchy";
import { OpportunityBrowser } from "@/components/tutor/opportunities/OpportunityBrowser";
import type { CascadeResumeState } from "@/components/tutor/onboarding/types";

export default async function TutorOpportunitiesPage() {
  const session = await requireActiveTutor();
  const [page, provinces, profileSnap] = await Promise.all([
    getOpenOpportunities(session.tutor?.branchId ?? null, {}, null),
    getProvinces(),
    tutorProfilesCollection().doc(session.uid).get(),
  ]);
  const profile = profileSnap.exists ? profileSnap.data()! : null;

  // Pre-fill the "narrow within your city" filter with the tutor's own
  // area — they came here to browse their own neighborhood first, not
  // "any" — same ancestry-walk pattern as onboarding's location step.
  let initialCascade: CascadeResumeState | undefined;
  if (profile?.preferredLocationId) {
    const ancestry = await getLocationAncestry(profile.preferredLocationId); // [ward, localGovernment, district, province]
    const [ward, localGovernment, district, province] = ancestry;
    if (ward?.level === "WARD" && localGovernment && district && province) {
      const [districts, localGovernments] = await Promise.all([
        getDistrictsForProvince(province.id),
        getLocalGovernmentsForDistrict(district.id),
      ]);
      initialCascade = {
        provinceId: province.id,
        districtId: district.id,
        localGovernmentId: localGovernment.id,
        districts,
        localGovernments,
      };
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Available Tuitions</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {page.totalCount} open tuition{page.totalCount === 1 ? "" : "s"} in your city right now.
        </p>
      </div>
      <OpportunityBrowser initialPage={page} provinces={provinces} initialCascade={initialCascade} />
    </div>
  );
}
