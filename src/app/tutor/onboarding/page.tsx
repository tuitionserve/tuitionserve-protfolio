import { redirect } from "next/navigation";
import { requireActiveTutor } from "@/server/auth/guards";
import { tutorProfilesCollection } from "@/server/domain/collections";
import { getCityLocationOptions } from "@/server/queries/locations";
import { OnboardingWizard } from "@/components/tutor/onboarding/OnboardingWizard";

export default async function TutorOnboardingPage() {
  const session = await requireActiveTutor();
  if (!session.tutor) redirect("/login");
  if (session.tutor.verificationStatus !== "PROFILE_INCOMPLETE") {
    redirect("/tutor/dashboard");
  }

  const [profileSnap, locationOptions] = await Promise.all([
    tutorProfilesCollection().doc(session.uid).get(),
    getCityLocationOptions(),
  ]);
  const profile = profileSnap.exists ? profileSnap.data()! : null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Complete Your Profile</h1>
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
                subjects: profile.subjects,
                grades: profile.grades,
                teachingExperienceSummary: profile.teachingExperienceSummary,
                expectedMonthlyFee: profile.expectedMonthlyFee,
                preferredLocationId: profile.preferredLocationId,
                preferredLocality: profile.preferredLocality,
                availability: profile.availability,
                hasCv: Boolean(profile.cvDocumentId),
              }
            : null
        }
        locationOptions={locationOptions}
      />
    </div>
  );
}
