"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. Redirecting to login...");
    window.setTimeout(() => {
      router.push("/login");
    }, 1200);
  }

  return (
    <form className="auth-form" action={handleSubmit}>
      <label>
        New password
        <input name="password" type="password" required minLength={8} />
      </label>
      <label>
        Confirm password
        <input name="confirmPassword" type="password" required minLength={8} />
      </label>
      {error ? <p className="form-message error">{error}</p> : null}
      {message ? <p className="form-message success">{message}</p> : null}
      <button type="submit">Update Password</button>
    </form>
  );
}
