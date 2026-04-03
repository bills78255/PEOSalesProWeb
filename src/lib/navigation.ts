import type { Route } from "next";

import type { AppRole } from "@/lib/auth/roles";

export type NavItem = {
  href: Route;
  label: string;
  roles?: AppRole[];
};

export const primaryNav: NavItem[] = [
  { href: "/dashboard" as Route, label: "Dashboard" },
  { href: "/training" as Route, label: "Training" },
  { href: "/scripts" as Route, label: "Scripts" },
  { href: "/calculators" as Route, label: "Calculators" },
  { href: "/pipeline" as Route, label: "Pipeline" },
  { href: "/opportunities" as Route, label: "Opportunities" },
  { href: "/wins" as Route, label: "Wins" },
  { href: "/insights" as Route, label: "Insights" },
  { href: "/settings" as Route, label: "Profile & Settings" }
];

export const adminNav: NavItem[] = [
  { href: "/admin" as Route, label: "CMS Dashboard", roles: ["admin"] },
  { href: "/admin/trainings" as Route, label: "Manage Trainings", roles: ["admin"] },
  { href: "/admin/quizzes" as Route, label: "Manage Quizzes", roles: ["admin"] },
  { href: "/admin/scripts" as Route, label: "Manage Scripts", roles: ["admin"] },
  { href: "/admin/articles" as Route, label: "Manage Articles", roles: ["admin"] },
  { href: "/admin/pipeline" as Route, label: "Manage Pipeline", roles: ["admin"] },
  { href: "/admin/opportunities" as Route, label: "Manage Opportunities", roles: ["admin"] },
  { href: "/admin/users" as Route, label: "Manage Users", roles: ["admin"] },
  { href: "/admin/wins" as Route, label: "Manage Wins", roles: ["admin"] }
];

export function itemsForRole(items: NavItem[], role?: AppRole | null): NavItem[] {
  return items.filter((item) => !item.roles || (role ? item.roles.includes(role) : false));
}