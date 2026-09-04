import { redirect } from "next/navigation";
import { requireActiveTutor } from "@/server/auth/guards";
import { tutorProfilesCollection } from "@/server/domain/collections";
import {
  getDistrictsForProvince,
  getLocalGovernmentsForDistrict,
  getLocationAncestry,
  getProvinces,
} from "@/server/queries/location-hierarchy";
import { OnboardingWizard } from "@/components/tutor/onboarding/OnboardingWizard";
import type { CascadeResumeState } from "@/components/tutor/onboarding/types";

export default async function TutorOnboardingPage() {
  const session = await requireActiveTutor();
  if (!session.tutor) redirect("/login");
  const status = session.tutor.verificationStatus;
  if (status !== "PROFILE_INCOMPLETE" && status !== "REJECTED") {
    redirect("/tutor/dashboard");
  }

  const [profileSnap, provinces] = await Promise.all([
    tutorProfilesCollection().doc(session.uid).get(),
    getProvinces(),
  ]);
  const profile = profileSnap.exists ? profileSnap.data()! : null;

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
        wardNumber: ward.wardNumber ?? undefined,
        districts,
        localGovernments,
      };
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
        {status === "REJECTED" ? "Improve Your Profile" : "Complete Your Profile"}
      </h1>
      {status === "REJECTED" && (
        <div className="bg-error-container/60 border border-error rounded-xl p-lg mb-6">
          <p className="font-label-md text-label-md text-on-error-container mb-1">Changes required</p>
          <p className="font-body-sm text-body-sm text-on-error-container">
            {session.tutor.rejectionReason ?? "The admin team requested changes to your profile."}
          </p>
        </div>
      )}
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">
        Fill in each section, then submit for admin review. Your progress is saved as you go.
      </p>
      <OnboardingWizard
        initialProfile={
          profile
            ? {
                fullName: profile.fullName,
                phone: profile.phone,
                gender: profile.gender,
                dateOfBirth: profile.dateOfBirth,
                address: profile.address,
                hasPhoto: Boolean(profile.profilePhotoDocumentId),
                highestQualification: profile.highestQualification,
                institution: profile.institution,
                graduationYear: profile.graduationYear,
                majorSubject: profile.majorSubject,
                // A profile whose Teaching/Availability steps were never
                // (successfully) saved has these fields entirely absent
                // in Firestore, not `[]` — default them here so a
                // returning tutor resuming mid-onboarding doesn't crash
                // the wizard (see the matching guard in
                // submitTutorProfileForReview).
                subjects: profile.subjects ?? [],
                grades: profile.grades ?? [],
                teachingExperienceSummary: profile.teachingExperienceSummary,
                expectedMonthlyFee: profile.expectedMonthlyFee,
                preferredLocationId: profile.preferredLocationId,
                preferredLocationLabel: null,
                preferredLocality: profile.preferredLocality,
                availability: profile.availability ?? [],
                hasCv: Boolean(profile.cvDocumentId),
              }
            : null
        }
        provinces={provinces}
        initialCascade={initialCascade}
      />
    </div>
  );
}
