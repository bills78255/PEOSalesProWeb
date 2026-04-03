"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (typeof window !== "undefined") {
    let hostname: string | null = null;

    try {
      hostname = supabaseURL ? new URL(supabaseURL).hostname : null;
    } catch {
      hostname = null;
    }

    console.log("[Supabase Debug]", {
      hasSupabaseURL: Boolean(supabaseURL),
      hasSupabaseAnonKey: Boolean(supabaseAnonKey),
      supabaseHostname: hostname
    });
  }

  return createBrowserClient(
    supabaseURL!,
    supabaseAnonKey!
  );
}
