import Link from "next/link";

import { SiteHeader } from "@/components/public/site-header";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="marketing-shell">
      <SiteHeader />
      <section className="hero">
        <div>
          <p className="eyebrow">Sales Enablement Platform</p>
          <h1>PEO Sales Pro gives reps, franchisees, and admins one shared growth workspace.</h1>
          <p className="hero-copy">
            Train your team, manage pipeline activity, browse marketplace opportunities, track wins, run commission calculators, and publish sales content from one shared backend that can also power the iPhone app later.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="button-link">
              Create Account
            </Link>
            <Link href="/login" className="ghost-link">
              Login
            </Link>
          </div>
        </div>
        <Card className="hero-card" eyebrow="MVP Scope" title="What this foundation includes">
          <ul className="feature-list">
            <li>Supabase auth and shared profile roles</li>
            <li>Dashboard, training, scripts, calculators, pipeline, opportunities marketplace, wins, insights</li>
            <li>Admin management areas for users, articles, pipeline, marketplace listings, and wins</li>
            <li>Responsive web structure ready for desktop, tablet, and mobile</li>
          </ul>
        </Card>
      </section>
      <section className="marketing-grid">
        <Card eyebrow="For reps" title="Move faster in the field">
          <p>Surface training, objection handling, calculators, and pipeline workflows in one clean workspace.</p>
        </Card>
        <Card eyebrow="For franchisees" title="Share the same playbook">
          <p>Give franchisees consistent scripts, training, insights, and visibility into the pipeline.</p>
        </Card>
        <Card eyebrow="For admins" title="Control the platform">
          <p>Manage users, publish content, tune calculators, oversee pipeline health, and curate marketplace listings from a central admin layer.</p>
        </Card>
      </section>
    </main>
  );
}
