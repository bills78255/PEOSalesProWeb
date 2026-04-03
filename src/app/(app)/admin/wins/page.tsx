import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";

export default function AdminWinsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin"
        title="Manage wins"
        description="Moderate win posts, clean up duplicates, and highlight the most meaningful team results."
      />
      <Card title="Starter moderation flow">
        <ul className="stack-list">
          <li>Publish or unpublish wins</li>
          <li>Link wins to opportunities later</li>
          <li>Use wins as a visible morale and coaching loop</li>
        </ul>
      </Card>
    </div>
  );
}
