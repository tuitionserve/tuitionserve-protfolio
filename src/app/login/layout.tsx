import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/session";

/** A signed-in user has no business on the login page — bounce them to their dashboard instead of showing the form. */
export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (session) {
    redirect(session.role === "TUTOR" ? "/tutor/dashboard" : "/admin/dashboard");
  }
  return children;
}
