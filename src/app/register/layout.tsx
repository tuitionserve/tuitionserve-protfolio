import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Become a Tutor — Register",
  robots: { index: false, follow: false },
};

/** A signed-in user has no business on the register page — bounce them to their dashboard instead of showing the form. */
export default async function RegisterLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (session) {
    redirect(session.role === "TUTOR" ? "/tutor/dashboard" : "/admin/dashboard");
  }
  return children;
}
