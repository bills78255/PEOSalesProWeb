import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";

export default function AdminUsersPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin"
        title="Manage users"
        description="Assign roles, review active accounts, and manage the team directory."
      />
      <Card title="Starter user administration">
        <ul className="stack-list">
          <li>Role assignment: admin, rep, franchisee</li>
          <li>Active/inactive profile state</li>
          <li>Future invite and onboarding workflows</li>
        </ul>
      </Card>
    </div>
  );
}
