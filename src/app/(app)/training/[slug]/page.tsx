import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import {
  publicationLabel,
  trainingCategoryLabel,
  type TrainingLessonRecord,
  type TrainingRecord
} from "@/lib/cms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TrainingDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TrainingDetailPage({ params }: TrainingDetailPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: trainingData, error: trainingError } = await supabase
    .from("trainings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (trainingError || !trainingData) {
    notFound();
  }

  const training = trainingData as TrainingRecord;
  const { data: lessonsData } = await supabase
    .from("training_lessons")
    .select("*")
    .eq("training_id", training.id)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const lessons = (lessonsData as TrainingLessonRecord[]) ?? [];
  const embeddableContent = training.content_url.toLowerCase().includes(".pdf") || training.content_url.includes("canva.com");

  return (
    <div className="page-stack">
      <Link href="/training" className="ghost-link training-back-link">
        Back to training
      </Link>

      <section className="training-detail-hero">
        {training.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={training.cover_image_url} alt={training.title} className="training-detail-image" />
        ) : null}
        <div className="training-detail-copy">
          <p className="eyebrow">{trainingCategoryLabel(training.category)}</p>
          <h1>{training.title}</h1>
          <p>{training.summary}</p>
          <div className="marketplace-meta">
            <span>{publicationLabel(training.status)}</span>
            <span>{trainingCategoryLabel(training.category)}</span>
          </div>
        </div>
      </section>

      <section className="training-detail-grid">
        <Card title="Training Content" eyebrow="Main Module">
          {embeddableContent ? (
            <iframe
              src={training.content_url}
              title={training.title}
              className="training-content-frame"
            />
          ) : null}
          <div className="admin-form-actions">
            <a href={training.content_url} target="_blank" rel="noreferrer" className="button-link">
              Open Content
            </a>
          </div>
        </Card>

        <Card title="Lessons" eyebrow="Optional Deep Dive">
          {lessons.length ? (
            <div className="training-lesson-list">
              {lessons.map((lesson) => (
                <article key={lesson.id} className="training-lesson-card">
                  <strong>{lesson.title}</strong>
                  {lesson.body ? <p>{lesson.body}</p> : null}
                  {lesson.action_step ? <p className="helper-text">Action step: {lesson.action_step}</p> : null}
                  {lesson.video_url ? (
                    <a href={lesson.video_url} target="_blank" rel="noreferrer" className="ghost-link">
                      Watch lesson video
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p>No supplemental lessons have been published for this module yet.</p>
          )}
        </Card>
      </section>
    </div>
  );
}
