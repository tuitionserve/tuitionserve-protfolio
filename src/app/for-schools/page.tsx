import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/public/StaticPageLayout";

export const metadata: Metadata = {
  title: "For Schools - Tuition Serve",
  description: "School partnerships with Tuition Serve — coming soon.",
};

export default function ForSchoolsPage() {
  return (
    <StaticPageLayout active="For Schools" title="For Schools" subtitle="Coming soon">
      <p>
        We&rsquo;re building dedicated tools for schools to partner with Tuition Serve. Check
        back soon, or get in touch to be the first to know when this launches.
      </p>
    </StaticPageLayout>
  );
}
