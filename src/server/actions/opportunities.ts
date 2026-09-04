"use server";

import { requireActiveTutor } from "@/server/auth/guards";
import { getOpenOpportunities, type OpportunityFilters, type TutorOpportunityView } from "@/server/queries/opportunities";

/** Browsing is available to any non-suspended tutor — applying (M8) is the action gated to APPROVED. */
export async function searchOpportunities(filters: OpportunityFilters): Promise<TutorOpportunityView[]> {
  await requireActiveTutor();
  return getOpenOpportunities(filters);
}
