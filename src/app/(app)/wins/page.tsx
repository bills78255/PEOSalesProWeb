import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";

export default function WinsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Wins"
        title="Wins and momentum"
        description="Celebrate new business, share learnings, and keep the team moving with visible momentum."
      />
      <Card title="Starter win feed">
        <ul className="stack-list">
          <li>Rep-submitted win posts</li>
          <li>Admin moderation or publishing if needed</li>
          <li>Link wins back to opportunities later</li>
        </ul>
      </Card>
    </div>
  );
}
