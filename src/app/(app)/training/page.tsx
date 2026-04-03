import type { Route } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";
import { trainingCategoryLabel, type TrainingRecord } from "@/lib/cms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TrainingPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const trainings = (data as TrainingRecord[]) ?? [];

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Training"
        title="Premium training library"
        description="Modern training modules built from Canva and external content, with optional lessons layered underneath."
      />
      {error ? (
        <Card title="Unable to load training content">
          <p>{error.message}</p>
        </Card>
      ) : trainings.length ? (
        <section className="training-grid">
          {trainings.map((training) => (
            <Link key={training.id} href={`/training/${training.slug}` as Route} className="training-card-link">
              <article className="training-card">
                {training.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={training.cover_image_url} alt={training.title} className="training-card-image" />
                ) : (
                  <div className="training-card-image training-card-image--placeholder">
                    <span>{trainingCategoryLabel(training.category)}</span>
                  </div>
                )}
                <div className="training-card-body">
                  <span className="marketplace-badge featured">{trainingCategoryLabel(training.category)}</span>
                  <h3>{training.title}</h3>
                  <p>{training.summary}</p>
                  <span className="ghost-link">Open training</span>
                </div>
              </article>
            </Link>
          ))}
        </section>
      ) : (
        <Card title="No published training yet">
          <p>Publish training modules from the admin CMS to surface them here.</p>
        </Card>
      )}
    </div>
  );
}
