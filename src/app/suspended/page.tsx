import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function SuspendedPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role !== "TUTOR" || session.tutor?.verificationStatus !== "SUSPENDED") {
    redirect(session.role === "TUTOR" ? "/tutor/dashboard" : "/admin/dashboard");
  }

  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 flex items-center justify-center px-margin-mobile py-xl">
        <div className="w-full max-w-[28rem] bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm p-lg text-center">
          <h1 className="font-headline-lg text-headline-lg text-error mb-4">Account Suspended</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-2">
            Your tutor account is currently suspended.
          </p>
          {session.tutor?.suspensionReason && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 bg-surface-container rounded-lg p-3">
              {session.tutor.suspensionReason}
            </p>
          )}
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            Please contact support for assistance.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <a
              href="mailto:tuitionserve@gmail.com"
              className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all inline-flex items-center justify-center min-h-[44px] w-full"
            >
              Contact Support
            </a>
            <LogoutButton className="font-label-md text-label-md text-secondary underline" />
          </div>
        </div>
      </main>
    </div>
  );
}
