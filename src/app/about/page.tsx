import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/public/StaticPageLayout";

export const metadata: Metadata = {
  title: "About Us - Tuition Serve",
  description: "How Tuition Serve matches parents with verified home tutors.",
};

export default function AboutPage() {
  return (
    <StaticPageLayout active="About Us" title="About Us">
      <p>
        Tuition Serve connects parents looking for a home tutor with verified, independent
        tutors — but every match is reviewed by our team rather than left to chance. Parents
        submit their requirements, our team reviews and confirms them, verified tutors apply,
        and our team makes the final selection.
      </p>
      <p>
        We believe this admin-in-the-loop approach matters: it means every tutor a parent meets
        has actually been vetted, and every request is routed to the right local team before a
        tutor is ever involved.
      </p>
      <h2>What we do</h2>
      <ul>
        <li>Review every tutor&rsquo;s profile and credentials before they can accept students.</li>
        <li>Review every parent request before it&rsquo;s opened up to tutors.</li>
        <li>Personally select the right tutor for each request, rather than leaving parents to browse and choose.</li>
      </ul>
      <p>
        This is currently a home-tuition service — a tutor visits the student. Payment for
        tuition is arranged directly between parents and tutors, outside the platform.
      </p>
    </StaticPageLayout>
  );
}
