import { requireActiveTutor } from "@/server/auth/guards";
import { getOpenOpportunities } from "@/server/queries/opportunities";
import { getProvinces } from "@/server/queries/location-hierarchy";
import { OpportunityBrowser } from "@/components/tutor/opportunities/OpportunityBrowser";

export default async function TutorOpportunitiesPage() {
  await requireActiveTutor();
  const [page, provinces] = await Promise.all([getOpenOpportunities({}, null), getProvinces()]);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Available Tuitions</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {page.totalCount} open tuition{page.totalCount === 1 ? "" : "s"} right now.
        </p>
      </div>
      <OpportunityBrowser initialPage={page} provinces={provinces} />
    </div>
  );
}
