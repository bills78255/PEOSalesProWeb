import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Welcome back</p>
        <h1>Login to PEO Sales Pro</h1>
        <p>Access your dashboard, training library, scripts, pipeline, marketplace opportunities, calculators, and wins.</p>
        <LoginForm />
        <div className="auth-links">
          <Link href="/forgot-password">Forgot password?</Link>
          <Link href="/signup">Need an account?</Link>
        </div>
      </section>
    </main>
  );
}
