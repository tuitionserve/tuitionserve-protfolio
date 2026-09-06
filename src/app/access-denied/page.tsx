import { LogoutButton } from "@/components/auth/LogoutButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

/**
 * Where requireRole() sends a tutor or an anonymous visitor caught
 * deliberately trying an admin/super-admin URL — see the doc comment
 * there for why this is separate from the plain /login bounce every
 * other unauthorized case gets. Top-level route, outside admin/
 * layout.tsx, so it can never redirect back into itself.
 */
export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-margin-mobile py-xl">
      <div className="w-full max-w-[32rem] border-2 border-error rounded-xl bg-error-container/10 shadow-[0_0_60px_-10px_rgba(186,26,26,0.5)] p-xl text-center flex flex-col items-center gap-4">
        <MaterialIcon name="gpp_bad" filled className="text-error text-7xl" />
        <h1 className="font-headline-lg text-headline-lg text-error tracking-wide">ACCESS DENIED</h1>
        <p className="font-body-md text-body-md text-white/80">
          This area is restricted to admin staff. You don&rsquo;t have permission to be here, and this attempt has
          been logged.
        </p>
        <p className="font-label-md text-label-md text-white/50">
          Don&rsquo;t try this again — it won&rsquo;t end well for you next time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
          <a
            href="/"
            className="flex-1 bg-error text-on-error font-label-md text-label-md rounded-lg py-3 shadow-sm hover:shadow-md transition-all text-center"
          >
            Take Me Somewhere Safe
          </a>
          <LogoutButton className="flex-1 border border-white/30 text-white/70 font-label-md text-label-md rounded-lg py-3 hover:bg-white/5 transition-all" />
        </div>
      </div>
    </div>
  );
}
