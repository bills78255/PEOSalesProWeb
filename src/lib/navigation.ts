import type { Route } from "next";

import type { AppRole } from "@/lib/auth/roles";

export type NavItem = {
  href: Route;
  label: string;
  roles?: AppRole[];
};

export const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training", label: "Training" },
  { href: "/scripts", label: "Scripts" },
  { href: "/calculators", label: "Calculators" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/wins", label: "Wins" },
  { href: "/insights", label: "Insights" },
  { href: "/settings", label: "Profile & Settings" }
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "CMS Dashboard", roles: ["admin"] },
  { href: "/admin/trainings", label: "Manage Trainings", roles: ["admin"] },
  { href: "/admin/quizzes", label: "Manage Quizzes", roles: ["admin"] },
  { href: "/admin/scripts", label: "Manage Scripts", roles: ["admin"] },
  { href: "/admin/articles", label: "Manage Articles", roles: ["admin"] },
  { href: "/admin/pipeline", label: "Manage Pipeline", roles: ["admin"] },
  { href: "/admin/opportunities", label: "Manage Opportunities", roles: ["admin"] },
  { href: "/admin/users", label: "Manage Users", roles: ["admin"] },
  { href: "/admin/wins", label: "Manage Wins", roles: ["admin"] }
];

export function itemsForRole(items: NavItem[], role?: AppRole | null) {
  return items.filter((item) => !item.roles || (role ? item.roles.includes(role) : false));
}
