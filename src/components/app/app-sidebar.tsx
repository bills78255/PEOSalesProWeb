import Link from "next/link";

import { roleLabel, type AppRole } from "@/lib/auth/roles";
import { adminNav, itemsForRole, primaryNav } from "@/lib/navigation";

type AppSidebarProps = {
  role?: AppRole | null;
  name?: string | null;
};

export function AppSidebar({ role, name }: AppSidebarProps) {
  const primaryItems = itemsForRole(primaryNav, role);
  const adminItems = itemsForRole(adminNav, role);

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">PSP</span>
        <div>
          <strong>PEO Sales Pro</strong>
          <small>{roleLabel(role)} workspace</small>
        </div>
      </div>
      <div className="sidebar-user">
        <span className="user-avatar">{(name || "U").slice(0, 1).toUpperCase()}</span>
        <div>
          <strong>{name || "User"}</strong>
          <small>{roleLabel(role)}</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        <p className="sidebar-heading">Workspace</p>
        {primaryItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      {adminItems.length ? (
        <nav className="sidebar-nav">
          <p className="sidebar-heading">Admin</p>
          {adminItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </aside>
  );
}
