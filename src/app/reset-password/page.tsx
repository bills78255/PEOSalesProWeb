import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Password reset</p>
        <h1>Set a new password</h1>
        <p>Choose a new password to finish resetting your account.</p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
