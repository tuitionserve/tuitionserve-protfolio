import { MaterialIcon } from "@/components/ui/MaterialIcon";

/**
 * A collapsible (native <details>, no JS needed) filter bar for
 * Super-Admin list pages that would otherwise show every branch's rows
 * mixed together. Stays collapsed by default to save space; opens
 * automatically when a filter is already active so it's obvious one is
 * applied. Submits as a plain GET form so filtered pages stay
 * server-rendered and bookmarkable, same as pagination elsewhere.
 */
export function FilterBar({
  action,
  active,
  children,
}: {
  action: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={active} className="group border border-surface-variant rounded-lg bg-surface-container-lowest">
      <summary className="cursor-pointer list-none flex items-center gap-2 px-4 py-2.5 select-none">
        <MaterialIcon name="filter_list" className="text-xl text-on-surface-variant" />
        <span className="font-label-md text-label-md text-on-surface-variant">Filters</span>
        {active && <span className="font-label-md text-label-md bg-primary-container text-on-primary px-2 py-0.5 rounded-full">On</span>}
        <MaterialIcon name="expand_more" className="ml-auto text-xl text-on-surface-variant transition-transform group-open:rotate-180" />
      </summary>
      <form method="get" action={action} className="flex flex-wrap items-end gap-3 px-4 pb-4 pt-1">
        {children}
        <button
          type="submit"
          className="font-label-md text-label-md bg-primary-container text-on-primary rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-all"
        >
          Apply
        </button>
        {active && (
          <a href={action} className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-2 py-2">
            Clear
          </a>
        )}
      </form>
    </details>
  );
}

export function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-md text-[11px] text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}

export const filterSelectClass =
  "border border-outline-variant rounded-lg py-2 px-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 min-w-[10rem]";

/** The one filter field every Super-Admin list page needs — which branch to narrow to. */
export function BranchFilterField({
  branches,
  value,
}: {
  branches: { id: string; name: string }[];
  value: string | null;
}) {
  return (
    <FilterField label="Branch">
      <select name="branch" defaultValue={value ?? ""} className={filterSelectClass}>
        <option value="">All branches</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    </FilterField>
  );
}
