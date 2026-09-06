"use server";

import { requireActiveTutor } from "@/server/auth/guards";
import { getOpenOpportunities, type OpportunityFilters } from "@/server/queries/opportunities";
import type { PageResult } from "@/server/domain/pagination";
import type { TutorOpportunityView } from "@/server/queries/opportunities";

/** Browsing is available to any non-suspended tutor — applying (M8) is the action gated to APPROVED. */
export async function searchOpportunities(
  filters: OpportunityFilters,
  cursor: string | null,
): Promise<PageResult<TutorOpportunityView>> {
  const session = await requireActiveTutor();
  return getOpenOpportunities(session.tutor?.branchId ?? null, filters, cursor);
}
