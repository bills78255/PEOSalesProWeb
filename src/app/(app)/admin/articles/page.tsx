import { ArticlesCMS } from "@/components/admin/articles-cms";
import { PageIntro } from "@/components/ui/page-intro";

export default function AdminArticlesPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin"
        title="Manage articles"
        description="Create, edit, publish, and archive the insights content surfaced across the platform."
      />
      <ArticlesCMS />
    </div>
  );
}
