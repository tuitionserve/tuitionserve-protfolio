import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Tone = "primary" | "secondary" | "tertiary" | "error";

const TONE_CLASSES: Record<Tone, { card: string; icon: string }> = {
  primary: { card: "bg-primary-container/10", icon: "bg-primary-container text-on-primary" },
  secondary: { card: "bg-secondary-container/30", icon: "bg-secondary-container text-on-secondary-container" },
  tertiary: { card: "bg-tertiary-container/15", icon: "bg-tertiary-container text-on-tertiary-container" },
  error: { card: "bg-error-container/30", icon: "bg-error text-on-error" },
};

/** A colorful, icon-led stat tile — the SaaS-dashboard-style building block used on every role's dashboard. */
export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  href,
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: Tone;
  href?: string;
}) {
  const t = TONE_CLASSES[tone];
  const content = (
    <div
      className={`rounded-2xl border border-surface-variant p-lg flex items-center gap-4 h-full transition-all ${t.card} ${
        href ? "hover:shadow-md hover:-translate-y-0.5" : ""
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${t.icon}`}>
        <MaterialIcon name={icon} filled className="text-2xl" />
      </div>
      <div className="min-w-0">
        <p className="font-display-lg text-headline-lg text-on-surface leading-none">{value}</p>
        <p className="font-label-md text-label-md text-on-surface-variant mt-1.5 truncate">{label}</p>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}
