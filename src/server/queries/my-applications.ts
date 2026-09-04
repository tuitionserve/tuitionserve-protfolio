import { tuitionRequestsCollection, tutorApplicationsCollection } from "@/server/domain/collections";
import type { TutorApplication, TuitionRequest } from "@/server/domain/types";

export interface MyApplicationRow {
  application: TutorApplication;
  tuition: TuitionRequest | null; // tutor-safe fields are read from here by the page, never exactAddress
}

export async function getMyApplications(tutorId: string): Promise<MyApplicationRow[]> {
  const snap = await tutorApplicationsCollection().where("tutorId", "==", tutorId).get();
  const applications = snap.docs
    .map((d) => d.data())
    .sort((a, b) => (b.appliedAt?.toMillis() ?? 0) - (a.appliedAt?.toMillis() ?? 0));

  const tuitions = await Promise.all(applications.map((a) => tuitionRequestsCollection().doc(a.tuitionId).get()));

  return applications.map((application, i) => ({
    application,
    tuition: tuitions[i]?.exists ? tuitions[i]!.data()! : null,
  }));
}
