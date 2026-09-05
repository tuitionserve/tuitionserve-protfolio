import { redirect } from "next/navigation";
import { requireActiveTutor } from "@/server/auth/guards";
import { tutorProfilesCollection } from "@/server/domain/collections";
import { getMyPendingChangeRequest } from "@/server/actions/profile-changes";
import { AdvancedEditForm } from "@/components/tutor/profile/AdvancedEditForm";

export default async function AdvancedEditPage() {
  const session = await requireActiveTutor();
  const tutor = session.tutor!;

  // Advanced edit only makes sense once approved — before that, the
  // normal onboarding wizard is fully open for editing anyway.
  if (tutor.verificationStatus !== "APPROVED") {
    redirect("/tutor/onboarding");
  }

  const [profileSnap, pendingRequest] = await Promise.all([
    tutorProfilesCollection().doc(session.uid).get(),
    getMyPendingChangeRequest(),
  ]);
  const profile = profileSnap.data();
  if (!profile) redirect("/tutor/profile");

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Advanced Edit</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Your profile is approved, so these changes need an admin&rsquo;s review before they go live.
        </p>
      </div>

      {pendingRequest ? (
        <div className="bg-tertiary-container/20 border border-tertiary-container rounded-xl p-lg">
          <p className="font-label-md text-label-md text-on-surface">
            You already have a change request pending review ({pendingRequest.changeUid}).
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            You&rsquo;ll be notified once an admin decides. You can submit another request after this one is
            reviewed.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <AdvancedEditForm profile={profile} />
        </div>
      )}
    </div>
  );
}
