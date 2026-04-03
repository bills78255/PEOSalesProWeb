"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const supabase = createSupabaseBrowserClient();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    const email = String(formData.get("email") || "").trim();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password reset instructions have been sent if the email exists.");
  }

  return (
    <form className="auth-form" action={handleSubmit}>
      <label>
        Email
        <input name="email" type="email" placeholder="you@company.com" required />
      </label>
      {error ? <p className="form-message error">{error}</p> : null}
      {message ? <p className="form-message success">{message}</p> : null}
      <button type="submit">Send Reset Link</button>
    </form>
  );
}
