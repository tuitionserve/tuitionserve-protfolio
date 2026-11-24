
import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/public/StaticPageLayout";

export const metadata: Metadata = {
  title: "Home Tuition Rate List - Tuition Serve",
  description:
    "Estimated home tuition rates in Kathmandu Valley, Nepal.",
};

export default function HomeTuitionRateListPage() {
  return (
    <StaticPageLayout
      title="Home Tuition – Rate List"
      subtitle="Kathmandu Valley, Nepal · Estimated Monthly Tuition Rates (NPR)"
    >
      <div className="space-y-8">
        {/* Branding */}
        <section className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-wide">
            TUITION SERVE
          </h2>
          <p className="font-semibold text-blue-600">
            WE SERVE BEST
          </p>
          <p className="text-sm">
            Home Tuition | Online Tuition | Qualified Teachers
          </p>
        </section>

        {/* Introduction */}
        <section className="space-y-2">
          <h2 className="text-xl font-bold">
            HOME TUITION – RATE LIST
          </h2>
          <p className="font-medium">
            Kathmandu Valley, Nepal
          </p>
          <p>
            Estimated Monthly Tuition Rates (NPR)
          </p>
        </section>

        {/* 1. NEB / National Curriculum */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            1. NEB / National Curriculum
          </h2>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[450px] text-left text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 font-semibold">
                    Class / Level
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Monthly Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Pre-Nursery, LKG & UKG", "Rs. 5,000–6,000"],
                  ["Class 1–5", "Rs. 5,000–6,000"],
                  ["Class 6", "Rs. 6,000"],
                  ["Class 7", "Rs. 7,000–8,000"],
                  ["Class 8", "Rs. 8,000–9,000"],
                  ["Class 9", "Rs. 9,000–10,000"],
                  ["Class 10 (Full Academic Year)", "Rs. 10,000"],
                  ["Class 10 (After Kartik)", "Rs. 12,000 onwards"],
                  ["Class 10 (Experienced Teacher)", "Up to Rs. 15,000"],
                ].map(([level, salary]) => (
                  <tr key={level} className="border-t">
                    <td className="px-4 py-3">{level}</td>
                    <td className="px-4 py-3">{salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. NEB Grade 11 & 12 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            2. NEB – Grade 11 & 12
          </h2>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 font-semibold">
                    Subjects
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Monthly Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["One Subject", "Rs. 12,000–15,000"],
                  ["Two Subjects", "Rs. 15,000–18,000"],
                  ["Three Subjects", "Rs. 16,000–20,000+"],
                  ["All Subjects / Complete Guidance", "Rs. 20,000+"],
                ].map(([subject, salary]) => (
                  <tr key={subject} className="border-t">
                    <td className="px-4 py-3">{subject}</td>
                    <td className="px-4 py-3">{salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. CBSE Curriculum */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            3. CBSE Curriculum
          </h2>

          <ul className="list-disc space-y-2 pl-6">
            <li>
              Up to Class 10: NEB rates + Rs. 2,000–3,000.
            </li>
            <li>
              Class 11 & 12: Rs. 15,000–20,000+.
            </li>
            <li>
              Rates depend on subjects and teacher qualifications.
            </li>
          </ul>
        </section>

        {/* 4. IB Curriculum */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            4. IB Curriculum (International Baccalaureate)
          </h2>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[450px] text-left text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 font-semibold">
                    Programme
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Estimated Monthly Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "PYP (Primary Years Programme)",
                    "Rs. 7,000–10,000+",
                  ],
                  [
                    "MYP (Middle Years Programme)",
                    "Rs. 10,000–15,000+",
                  ],
                  [
                    "DP (Diploma Programme – Grade 11 & 12)",
                    "Rs. 15,000–25,000+",
                  ],
                ].map(([programme, salary]) => (
                  <tr key={programme} className="border-t">
                    <td className="px-4 py-3">{programme}</td>
                    <td className="px-4 py-3">{salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            IB-specialized and experienced teachers may charge higher rates.
          </p>
        </section>

        {/* 5. Cambridge International / A-Level */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            5. Cambridge International / A-Level
          </h2>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[450px] text-left text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 font-semibold">
                    Level
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Cambridge Primary", "Rs. 7,000–10,000+"],
                  ["Cambridge Lower Secondary", "Rs. 9,000–13,000+"],
                  ["IGCSE / O-Level", "Rs. 12,000–18,000+"],
                  ["AS Level (Year 1)", "Rs. 1,000+ per hour / subject"],
                  ["A2 Level (Year 2)", "Rs. 1,000+ per hour / subject"],
                ].map(([level, rate]) => (
                  <tr key={level} className="border-t">
                    <td className="px-4 py-3">{level}</td>
                    <td className="px-4 py-3">{rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Other International & Alternative Boards */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            6. Other International & Alternative Boards
          </h2>

          <p>
            The following curricula are also covered:
          </p>

          <ul className="list-disc space-y-2 pl-6">
            <li>British Curriculum</li>
            <li>Edexcel (Pearson)</li>
            <li>Cambridge International</li>
            <li>American Curriculum</li>
            <li>Australian Curriculum</li>
            <li>Indian CBSE & ICSE / ISC</li>
            <li>Montessori Curriculum</li>
            <li>Canadian Curriculum</li>
            <li>French Curriculum</li>
            <li>Singapore Curriculum</li>
            <li>Other International School Boards</li>
          </ul>

          <p>
            Rates will be determined according to grade, subject difficulty,
            syllabus and teacher expertise.
          </p>
        </section>

        {/* Important Notes */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            IMPORTANT NOTES
          </h2>

          <ol className="list-decimal space-y-2 pl-6">
            <li>
              All rates are estimated market rates for Kathmandu Valley.
            </li>
            <li>
              Standard monthly rates are based on 1 hour of tuition per day.
            </li>
            <li>
              For 1.5 hours or longer daily sessions, the monthly salary
              will increase accordingly.
            </li>
            <li>
              Rates may vary depending on teacher experience, qualifications,
              subjects, curriculum, location and distance.
            </li>
            <li>
              Specialized international-board teachers may charge higher
              rates.
            </li>
            <li>
              For A-Level and other advanced international programmes,
              hourly rates may apply.
            </li>
            <li>
              Final tuition fees should be mutually agreed upon by parents
              and teachers.
            </li>
          </ol>
        </section>

        {/* Contact */}
        <section className="space-y-4 border-t pt-6 text-center">
          <h2 className="text-xl font-bold">
            CONTACT
          </h2>

          <p className="font-medium">
            WhatsApp: 976-526-9150
          </p>

          <a
            href="https://wa.me/9779765269150"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Contact Us on WhatsApp
          </a>
        </section>

        {/* Footer Branding */}
        <section className="space-y-2 border-t pt-6 text-center">
          <h2 className="text-2xl font-bold tracking-wide">
            TUITION SERVE
          </h2>

          <p className="font-semibold text-blue-600">
            WE SERVE BEST
          </p>

          <p className="text-sm">
            Home Tuition | Online Tuition | Qualified Teachers
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
