import Link from "next/link";
import { requireActiveTutor } from "@/server/auth/guards";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireActiveTutor();

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-surface-container-lowest border-b border-surface-variant">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
          <Link href="/tutor/dashboard" className="font-headline-md text-headline-md font-bold text-primary">
            Tuition Serve
          </Link>
          <div className="flex items-center gap-md">
            <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">
              {session.tutor?.tutorUid}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        {children}
      </main>
    </div>
  );
}
