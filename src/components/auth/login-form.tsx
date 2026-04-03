"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setLoading(false);
      setError("Email and password are required.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="auth-form" action={handleSubmit}>
      <label>
        Email
        <input name="email" type="email" placeholder="you@company.com" required />
      </label>
      <label>
        Password
        <input name="password" type="password" placeholder="Enter your password" required />
      </label>
      {error ? <p className="form-message error">{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
