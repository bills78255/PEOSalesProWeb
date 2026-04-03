import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";
import { articleCategoryLabel, type ArticleRecord } from "@/lib/cms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function InsightsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("updated_at", { ascending: false });

  const articles = (data as ArticleRecord[]) ?? [];

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Insights"
        title="Articles and insights"
        description="Published articles from the CMS surface here for reps, managers, and franchise operators."
      />
      {error ? (
        <Card title="Unable to load articles">
          <p>{error.message}</p>
        </Card>
      ) : articles.length ? (
        <section className="content-grid">
          {articles.map((article) => (
            <Card key={article.id} title={article.title} eyebrow={articleCategoryLabel(article.category)}>
              <p>{article.preview}</p>
              <p className="helper-text">{article.body}</p>
            </Card>
          ))}
        </section>
      ) : (
        <Card title="No published articles yet">
          <p>Publish articles from the admin CMS to make them available here.</p>
        </Card>
      )}
    </div>
  );
}
