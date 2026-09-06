import { redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentSession } from "@/server/auth/session";
import { ForcedPasswordChangeForm } from "@/components/auth/ForcedPasswordChangeForm";

/**
 * Top-level route (not nested under /admin) — deliberately outside
 * admin/layout.tsx, whose requireRole() would redirect right back here
 * for a mustChangePassword session, looping forever. Uses
 * getCurrentSession() directly for the same reason (mirrors the
 * /suspended page's escape-hatch pattern).
 */
export default async function ChangePasswordRequiredPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!session.mustChangePassword) {
    redirect(session.role === "TUTOR" ? "/tutor/dashboard" : "/admin/dashboard");
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="w-full px-margin-mobile md:px-margin-desktop py-4">
        <Image src="/images/logo.svg" alt="Tuition Serve" width={128} height={32} className="h-8 w-auto" priority />
      </header>
      <main className="flex-1 flex items-center justify-center px-margin-mobile py-xl">
        <div className="w-full max-w-[28rem] bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm p-lg">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Set a New Password</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
            Your account was created with a temporary password. For security, set your own before continuing.
          </p>
          <ForcedPasswordChangeForm redirectTo="/admin/dashboard" />
        </div>
      </main>
    </div>
  );
}
