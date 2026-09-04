import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function TrustStrip() {
  return (
    <section className="w-full bg-surface-container py-8 border-y border-surface-variant">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          Trusted by students, parents &amp; teachers
        </p>
        <div className="flex justify-center gap-8 md:gap-xxl mt-6 opacity-60 grayscale flex-wrap">
          <div className="flex items-center gap-2">
            <MaterialIcon name="school" filled className="text-3xl" />
            <span className="font-headline-sm text-headline-sm">EduTrust</span>
          </div>
          <div className="flex items-center gap-2">
            <MaterialIcon name="verified_user" filled className="text-3xl" />
            <span className="font-headline-sm text-headline-sm">VerifyLearn</span>
          </div>
          <div className="flex items-center gap-2">
            <MaterialIcon name="menu_book" filled className="text-3xl" />
            <span className="font-headline-sm text-headline-sm">AcademicAlliance</span>
          </div>
        </div>
      </div>
    </section>
  );
}
