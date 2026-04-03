import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";
import { trainingCategoryLabel, type TrainingLessonRecord, type TrainingRecord } from "@/lib/cms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TrainingPage() {
  const supabase = await createSupabaseServerClient();
  const [trainingsResult, lessonsResult] = await Promise.all([
    supabase.from("trainings").select("*").eq("status", "published").order("sort_order", { ascending: true }),
    supabase.from("training_lessons").select("*").eq("status", "published").order("sort_order", { ascending: true })
  ]);

  const trainings = (trainingsResult.data as TrainingRecord[]) ?? [];
  const lessons = (lessonsResult.data as TrainingLessonRecord[]) ?? [];

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Training"
        title="Training library"
        description="Published training modules and lessons are managed in the admin CMS and surfaced here for reps."
      />
      {trainingsResult.error || lessonsResult.error ? (
        <Card title="Unable to load training content">
          <p>{trainingsResult.error?.message ?? lessonsResult.error?.message}</p>
        </Card>
      ) : trainings.length ? (
        <section className="content-grid">
          {trainings.map((training) => {
            const moduleLessons = lessons.filter((lesson) => lesson.training_id === training.id);

            return (
              <Card key={training.id} title={training.title} eyebrow={trainingCategoryLabel(training.category)}>
                <p>{training.summary}</p>
                {moduleLessons.length ? (
                  <ul className="stack-list">
                    {moduleLessons.map((lesson) => (
                      <li key={lesson.id}>
                        <strong>{lesson.title}</strong>
                        {lesson.action_step ? ` - ${lesson.action_step}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No published lessons are attached yet.</p>
                )}
              </Card>
            );
          })}
        </section>
      ) : (
        <Card title="No published training yet">
          <p>Publish training modules from the admin CMS to surface them here.</p>
        </Card>
      )}
    </div>
  );
}
