"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignupForm() {
  const supabase = createSupabaseBrowserClient();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const fullName = String(formData.get("fullName") || "").trim();
    const redirectBase =
      process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectBase ? `${redirectBase}/login` : undefined,
        data: {
          full_name: fullName
        }
      }
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Account created. Check your email if confirmation is enabled in Supabase.");
  }

  return (
    <form className="auth-form" action={handleSubmit}>
      <label>
        Full name
        <input name="fullName" type="text" placeholder="Taylor Smith" required />
      </label>
      <label>
        Email
        <input name="email" type="email" placeholder="you@company.com" required />
      </label>
      <label>
        Password
        <input name="password" type="password" placeholder="Create a password" required minLength={8} />
      </label>
      {error ? <p className="form-message error">{error}</p> : null}
      {message ? <p className="form-message success">{message}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
