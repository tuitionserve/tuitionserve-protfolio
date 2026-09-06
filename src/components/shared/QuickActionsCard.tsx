import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export interface QuickAction {
  label: string;
  href: string;
  icon: string;
}

export function QuickActionsCard({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Quick Actions</h2>
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
              <MaterialIcon name={action.icon} className="text-lg" />
            </span>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
