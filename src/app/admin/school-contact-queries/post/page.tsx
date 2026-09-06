import { requireRole } from "@/server/auth/guards";
import { SchoolContactForm } from "@/components/public/contact/SchoolContactForm";
import { submitSchoolContactQueryAsAdmin } from "@/server/actions/admin-school-contact";
import { BackButton } from "@/components/shared/BackButton";

export default async function AdminPostSchoolEnquiryPage() {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  return (
    <div className="max-w-2xl flex flex-col gap-lg">
      <BackButton />
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Post a School Enquiry</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          For a school that called or emailed you directly instead of using the For Schools form. This lands in
          the same School Contact Queries inbox as a public enquiry.
        </p>
      </div>
      <SchoolContactForm
        action={submitSchoolContactQueryAsAdmin}
        successHref="/admin/school-contact-queries"
        successHrefLabel="View School Contact Queries"
      />
    </div>
  );
}
