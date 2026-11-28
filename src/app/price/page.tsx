import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/public/StaticPageLayout";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";

export const metadata: Metadata = {
  title: "Home Tuition Rate List (NPR)",
  description: "Estimated monthly home tuition rates across Nepal (NPR) by grade and schedule.",
  alternates: { canonical: "/price" },
};

function RateTable({
  headers,
  rows,
}: {
  headers: [string, string];
  rows: readonly (readonly [string, string])[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-surface-variant bg-surface-container-lowest">
      <table className="w-full min-w-[420px] text-left font-body-sm text-body-sm">
        <thead>
          <tr className="bg-surface-container text-on-surface">
            <th className="px-4 py-3 font-label-md text-label-md">{headers[0]}</th>
            <th className="px-4 py-3 font-label-md text-label-md">{headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([col1, col2]) => (
            <tr key={col1} className="border-t border-surface-variant text-on-surface-variant">
              <td className="px-4 py-3 text-on-surface">{col1}</td>
              <td className="px-4 py-3">{col2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HomeTuitionRateListPage() {
  return (
    <StaticPageLayout
      active="Price"
      title="Home Tuition – Rate List"
      subtitle="Estimated Monthly Tuition Rates (NPR) · Baseline reference: Kathmandu Valley"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2>1. NEB / National Curriculum</h2>
          <RateTable
            headers={["Class / Level", "Monthly Salary"]}
            rows={[
              ["Pre-Nursery, LKG & UKG", "Rs. 5,000–6,000"],
              ["Class 1–5", "Rs. 5,000–6,000"],
              ["Class 6", "Rs. 6,000"],
              ["Class 7", "Rs. 7,000–8,000"],
              ["Class 8", "Rs. 8,000–9,000"],
              ["Class 9", "Rs. 9,000–10,000"],
              ["Class 10 (Full Academic Year)", "Rs. 10,000"],
              ["Class 10 (After Kartik)", "Rs. 12,000 onwards"],
              ["Class 10 (Experienced Teacher)", "Up to Rs. 15,000"],
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2>2. NEB – Grade 11 &amp; 12</h2>
          <RateTable
            headers={["Subjects", "Monthly Salary"]}
            rows={[
              ["One Subject", "Rs. 12,000–15,000"],
              ["Two Subjects", "Rs. 15,000–18,000"],
              ["Three Subjects", "Rs. 16,000–20,000+"],
              ["All Subjects / Complete Guidance", "Rs. 20,000+"],
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2>3. CBSE Curriculum</h2>
          <ul>
            <li>Up to Class 10: NEB rates + Rs. 2,000–3,000.</li>
            <li>Class 11 &amp; 12: Rs. 15,000–20,000+.</li>
            <li>Rates depend on subjects and teacher qualifications.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>4. IB Curriculum (International Baccalaureate)</h2>
          <RateTable
            headers={["Programme", "Estimated Monthly Salary"]}
            rows={[
              ["PYP (Primary Years Programme)", "Rs. 7,000–10,000+"],
              ["MYP (Middle Years Programme)", "Rs. 10,000–15,000+"],
              ["DP (Diploma Programme – Grade 11 & 12)", "Rs. 15,000–25,000+"],
            ]}
          />
          <p>IB-specialized and experienced teachers may charge higher rates.</p>
        </section>

        <section className="space-y-3">
          <h2>5. Cambridge International / A-Level</h2>
          <RateTable
            headers={["Level", "Rate"]}
            rows={[
              ["Cambridge Primary", "Rs. 7,000–10,000+"],
              ["Cambridge Lower Secondary", "Rs. 9,000–13,000+"],
              ["IGCSE / O-Level", "Rs. 12,000–18,000+"],
              ["AS Level (Year 1)", "Rs. 1,000+ per hour / subject"],
              ["A2 Level (Year 2)", "Rs. 1,000+ per hour / subject"],
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2>6. Other International &amp; Alternative Boards</h2>
          <p>The following curricula are also covered:</p>
          <ul>
            <li>British Curriculum &amp; Edexcel (Pearson)</li>
            <li>Cambridge International</li>
            <li>American, Canadian, Australian, French &amp; Singapore Curricula</li>
            <li>Indian CBSE &amp; ICSE / ISC</li>
            <li>Montessori Curriculum</li>
            <li>Other International School Boards</li>
          </ul>
          <p>Rates are determined according to grade, subject difficulty, syllabus, and teacher expertise.</p>
        </section>

        <section className="space-y-3">
          <h2>Important Notes</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Rates above are estimated benchmarks (typically Kathmandu Valley); regional branch rates may vary.</li>
            <li>Standard monthly rates are based on 1 hour of tuition per day.</li>
            <li>For 1.5 hours or longer daily sessions, the monthly salary scales accordingly.</li>
            <li>Rates may vary depending on teacher experience, qualifications, subjects, curriculum, location, and distance.</li>
            <li>Specialized international-board teachers may charge higher rates.</li>
            <li>For A-Level and other advanced international programmes, hourly rates may apply.</li>
            <li>Final tuition fees are mutually agreed upon by parents and teachers outside the platform.</li>
          </ol>
        </section>

        <section className="flex flex-col items-center gap-3 border-t border-surface-variant pt-lg text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Have questions about tuition rates in your city?
          </p>
          <WhatsAppButton message="Hi Tuition Serve, I have a question about tuition rates." />
        </section>
      </div>
    </StaticPageLayout>
  );
}
