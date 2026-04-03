import type { Route } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";

type AdminSection = {
  href: Route;
  title: string;
  description: string;
};

const sections: AdminSection[] = [
  {
    href: "/admin/trainings",
    title: "Trainings",
    description: "Manage modules, lessons, publishing state, and module order."
  },
  {
    href: "/admin/quizzes",
    title: "Quizzes",
    description: "Attach quizzes to lessons, manage questions, and mark correct answers."
  },
  {
    href: "/admin/scripts",
    title: "Scripts",
    description: "Publish prospecting talk tracks, objection responses, and featured playbooks."
  },
  {
    href: "/admin/articles",
    title: "Articles",
    description: "Edit insight content, previews, categories, and publish state."
  }
];

export default function AdminDashboardPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin CMS"
        title="Content management"
        description="Publish and maintain the training, script, quiz, and article content that powers PEO Sales Pro."
      />
      <section className="content-grid">
        {sections.map((section) => (
          <Card
            key={section.href}
            title={section.title}
            eyebrow="Content"
            action={
              <Link href={section.href} className="ghost-link">
                Open
              </Link>
            }
          >
            <p>{section.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
