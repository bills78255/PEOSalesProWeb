import { redirect } from "next/navigation";

import { appRoles, type AppRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppProfile = {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  title?: string | null;
};

type ProfileRoleJoin = { slug: string | null } | Array<{ slug: string | null }> | null;

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  title?: string | null;
  roles: ProfileRoleJoin;
};

function normalizeRoleSlug(roles: ProfileRoleJoin): AppRole | null {
  const joinedRole = Array.isArray(roles) ? roles[0] : roles;
  const slug = joinedRole?.slug;

  if (slug && appRoles.includes(slug as AppRole)) {
    return slug as AppRole;
  }

  return null;
}

export async function getCurrentAppUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,full_name,title,roles!inner(slug)")
    .eq("id", user.id)
    .single<ProfileRow>();

  const role = profile ? normalizeRoleSlug(profile.roles) : null;

  return {
    user,
    profile: profile && role
      ? {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          title: profile.title,
          role
        }
      : null
  };
}

export async function requireUser() {
  const result = await getCurrentAppUser();
  if (!result?.user) {
    redirect("/login");
  }
  return result;
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return result;
}
