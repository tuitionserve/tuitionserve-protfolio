import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/public/StaticPageLayout";

export const metadata: Metadata = {
  title: "Courses - Tuition Serve",
  description: "Structured courses on Tuition Serve — coming soon.",
};

export default function CoursesPage() {
  return (
    <StaticPageLayout active="Courses" title="Courses" subtitle="Coming soon">
      <p>
        We&rsquo;re working on structured courses in addition to one-on-one home tuition. Check
        back soon for updates.
      </p>
    </StaticPageLayout>
  );
}
