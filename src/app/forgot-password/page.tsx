import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Reset access</p>
        <h1>Forgot your password?</h1>
        <p>We’ll email you a secure reset link.</p>
        <ForgotPasswordForm />
        <div className="auth-links">
          <Link href="/login">Back to login</Link>
        </div>
      </section>
    </main>
  );
}
