import { LogoutButton } from "@/components/app/logout-button";
import type { AppRole } from "@/lib/auth/roles";

type AppTopbarProps = {
  title: string;
  subtitle: string;
  role?: AppRole | null;
};

export function AppTopbar({ title, subtitle, role }: AppTopbarProps) {
  return (
    <header className="app-topbar">
      <div>
        <p className="eyebrow">{role ? `${role.toUpperCase()} PORTAL` : "WORKSPACE"}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <LogoutButton />
    </header>
  );
}
