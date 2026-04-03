import { redirect } from "next/navigation";

import type { AppRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppProfile = {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  title?: string | null;
};

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
    .single();

  return {
    user,
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          title: profile.title,
          role: profile.roles.slug as AppRole
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
