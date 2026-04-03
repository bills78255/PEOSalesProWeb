import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Get started</p>
        <h1>Create your account</h1>
        <p>Sign up with email and password. Roles can be assigned or adjusted by admin after onboarding.</p>
        <SignupForm />
        <div className="auth-links">
          <Link href="/login">Already have an account?</Link>
        </div>
      </section>
    </main>
  );
}
