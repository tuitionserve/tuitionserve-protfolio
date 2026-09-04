import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function RequestTutorPage() {
  return (
    <>
      <PublicHeader active="Find a Tutor" />
      <main className="flex-1 flex items-center justify-center px-margin-mobile py-xxl max-w-max-width mx-auto w-full">
        <div className="max-w-lg text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            Request a Tutor
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            The full tuition request form — including location, schedule, and requirements — is
            being built next. In the meantime, please contact us directly and our team will help
            match you with a tutor.
          </p>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
