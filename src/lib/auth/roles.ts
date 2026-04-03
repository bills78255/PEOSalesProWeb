export const appRoles = ["admin", "rep", "franchisee"] as const;

export type AppRole = (typeof appRoles)[number];

export function isAdmin(role?: AppRole | null) {
  return role === "admin";
}

export function canAccessAdmin(role?: AppRole | null) {
  return role === "admin";
}

export function roleLabel(role?: AppRole | null) {
  if (role === "admin") return "Admin";
  if (role === "franchisee") return "Franchisee";
  return "Rep";
}
