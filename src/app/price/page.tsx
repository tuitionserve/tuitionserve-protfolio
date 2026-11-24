import React from "react";

const sections = [
  {
    number: "01",
    title: "NEB / National Curriculum",
    subtitle: "Estimated monthly tuition fee",
    columns: ["Class / Level", "Monthly Salary"],
    rows: [
      ["Pre-Nursery, LKG & UKG", "Rs. 5,000–6,000"],
      ["Class 1–5", "Rs. 5,000–6,000"],
      ["Class 6", "Rs. 6,000"],
      ["Class 7", "Rs. 7,000–8,000"],
      ["Class 8", "Rs. 8,000–9,000"],
      ["Class 9", "Rs. 9,000–10,000"],
      ["Class 10 (Full Academic Year)", "Rs. 10,000"],
      ["Class 10 (After Kartik)", "Rs. 12,000 onwards"],
      ["Class 10 (Experienced Teacher)", "Up to Rs. 15,000"],
    ],
  },
  {
    number: "02",
    title: "NEB – Grade 11 & 12",
    subtitle: "Monthly fee based on subject coverage",
    columns: ["Subjects", "Monthly Salary"],
    rows: [
      ["One Subject", "Rs. 12,000–15,000"],
      ["Two Subjects", "Rs. 15,000–18,000"],
      ["Three Subjects", "Rs. 16,000–20,000+"],
      ["All Subjects / Complete Guidance", "Rs. 20,000+"],
    ],
  },
  {
    number: "04",
    title: "IB Curriculum",
    subtitle: "International Baccalaureate · Estimated monthly salary",
    columns: ["Programme", "Estimated Monthly Salary"],
    rows: [
      ["PYP (Primary Years Programme)", "Rs. 7,000–10,000+"],
      ["MYP (Middle Years Programme)", "Rs. 10,000–15,000+"],
      ["DP (Diploma Programme – Grade 11 & 12)", "Rs. 15,000–25,000+"],
    ],
    note: "IB-specialized and experienced teachers may charge higher rates.",
  },
  {
    number: "05",
    title: "Cambridge International / A-Level",
    subtitle: "Monthly or hourly rates, depending on level",
    columns: ["Level", "Rate"],
    rows: [
      ["Cambridge Primary", "Rs. 7,000–10,000+"],
      ["Cambridge Lower Secondary", "Rs. 9,000–13,000+"],
      ["IGCSE / O-Level", "Rs. 12,000–18,000+"],
      ["AS Level (Year 1)", "Rs. 1,000+ per hour / subject"],
      ["A2 Level (Year 2)", "Rs. 1,000+ per hour / subject"],
    ],
  },
];

const otherBoards = [
  "British Curriculum",
  "Edexcel (Pearson)",
  "Cambridge International",
  "American Curriculum",
  "Australian Curriculum",
  "Indian CBSE & ICSE / ISC",
  "Montessori Curriculum",
  "Canadian Curriculum",
  "French Curriculum",
  "Singapore Curriculum",
  "Other International School Boards",
];

const notes = [
  "All rates are estimated market rates for Kathmandu Valley.",
  "Standard monthly rates are based on 1 hour of tuition per day.",
  "For 1.5 hours or longer daily sessions, the monthly salary will increase accordingly.",
  "Rates may vary depending on teacher experience, qualifications, subjects, curriculum, location and distance.",
  "Specialized international-board teachers may charge higher rates.",
  "For A-Level and other advanced international programmes, hourly rates may apply.",
  "Final tuition fees should be mutually agreed upon by parents and teachers.",
];

function RateTable({
  number,
  title,
  subtitle,
  columns,
  rows,
  note,
}: {
  number: string;
  title: string;
  subtitle: string;
  columns: [string, string];
  rows: [string, string][];
  note?: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-5 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white">
          {number}
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] text-left text-sm">
          <thead className="bg-blue-50 text-xs uppercase tracking-wide text-blue-900">
            <tr>
              <th className="px-5 py-3 font-semibold sm:px-6">{columns[0]}</th>
              <th className="px-5 py-3 text-right font-semibold sm:px-6">{columns[1]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(([label, value]) => (
              <tr key={label} className="transition-colors hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-700 sm:px-6">{label}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-slate-900 sm:px-6">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600 sm:px-6">{note}</p>}
    </section>
  );
}

export default function TuitionRateListPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 text-white">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[36px] border-white/5" />
        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Tuition Serve · We Serve Best
          </div>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Kathmandu Valley, Nepal</p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Home Tuition <span className="text-cyan-300">Rate List</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Estimated monthly tuition rates in NPR for NEB, CBSE and international curricula.
            </p>
            <div className="mt-8 inline-flex items-center rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white">
              <span className="mr-2 text-cyan-300">NPR</span>
              Estimated monthly tuition fees
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Tuition fee guide</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Estimated monthly rates</h2>
          </div>
          <p className="text-sm text-slate-500">Rates are indicative and may vary.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RateTable {...sections[0]} />
          <RateTable {...sections[1]} />
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-5 sm:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white">03</span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">CBSE Curriculum</h2>
                <p className="mt-1 text-sm text-slate-500">Estimated fee guidance</p>
              </div>
            </div>
            <div className="space-y-4 px-5 py-6 text-sm leading-6 text-slate-700 sm:px-6">
              <p className="rounded-xl bg-blue-50 p-4"><strong className="text-slate-900">Up to Class 10:</strong> NEB rates + Rs. 2,000–3,000.</p>
              <p className="rounded-xl bg-blue-50 p-4"><strong className="text-slate-900">Class 11 &amp; 12:</strong> Rs. 15,000–20,000+.</p>
              <p className="text-slate-500">Rates depend on subjects and teacher qualifications.</p>
            </div>
          </section>
          <RateTable {...sections[2]} />
          <RateTable {...sections[3]} />
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white">06</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Other International &amp; Alternative Boards</h2>
              <p className="mt-1 text-sm text-slate-500">We also support tuition across the following curricula.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherBoards.map((board) => (
              <div key={board} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-500" />
                {board}
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
            Rates will be determined according to grade, subject difficulty, syllabus and teacher expertise.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">!</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Please read</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Important Notes</h2>
            </div>
          </div>
          <ol className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {notes.map((note, index) => (
              <li key={note} className="flex gap-3 text-sm leading-6 text-slate-700">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                  {index + 1}
                </span>
                {note}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 to-blue-800 px-6 py-9 text-center text-white shadow-lg sm:px-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Need a home tutor?</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Let us find the right teacher.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blue-100">
            Home Tuition | Online Tuition | Qualified Teachers
          </p>
          <a
            href="https://wa.me/9779765269150"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-cyan-300 px-6 py-3.5 text-sm font-bold text-blue-950 shadow transition hover:bg-cyan-200 focus:outline-none focus:ring-4 focus:ring-cyan-200/40"
          >
            Contact on WhatsApp · 976-526-9150
          </a>
          <div className="mt-8 border-t border-white/15 pt-6">
            <p className="text-lg font-black tracking-[0.16em]">TUITION SERVE</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">WE SERVE BEST</p>
          </div>
        </section>
        <footer className="py-7 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Tuition Serve. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
