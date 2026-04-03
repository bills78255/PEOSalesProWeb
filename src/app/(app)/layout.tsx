import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { requireUser } from "@/lib/auth/session";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="app-shell">
      <AppSidebar role={profile?.role} name={profile?.full_name} />
      <div className="app-main">
        <AppTopbar
          title="PEO Sales Pro"
          subtitle="Unified sales enablement for reps, franchisees, and admins."
          role={profile?.role}
        />
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
