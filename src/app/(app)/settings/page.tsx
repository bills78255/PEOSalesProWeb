import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";

export default function SettingsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Settings"
        title="Profile and account settings"
        description="Update profile details, future notification preferences, and account settings."
      />
      <Card title="Starter settings sections">
        <ul className="stack-list">
          <li>Profile name, title, territory, and company</li>
          <li>Password reset and email preferences</li>
          <li>Role visibility controlled from the admin side</li>
        </ul>
      </Card>
    </div>
  );
}
