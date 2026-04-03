"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  contentStatusOptions,
  publicationLabel,
  slugify,
  trainingCategoryLabel,
  trainingCategoryOptions,
  type TrainingLessonRecord,
  type TrainingRecord
} from "@/lib/cms";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type TrainingFormState = {
  title: string;
  summary: string;
  category: string;
  coverImageURL: string;
  contentURL: string;
  status: "draft" | "published";
};

type LessonFormState = {
  title: string;
  body: string;
  videoURL: string;
  actionStep: string;
  status: "draft" | "published";
};

const emptyTrainingForm: TrainingFormState = {
  title: "",
  summary: "",
  category: trainingCategoryOptions[0]?.value ?? "prospecting",
  coverImageURL: "",
  contentURL: "",
  status: "draft"
};

const emptyLessonForm: LessonFormState = {
  title: "",
  body: "",
  videoURL: "",
  actionStep: "",
  status: "draft"
};

export function TrainingsCMS() {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [lessons, setLessons] = useState<TrainingLessonRecord[]>([]);
  const [selectedTrainingID, setSelectedTrainingID] = useState<string | null>(null);
  const [selectedLessonID, setSelectedLessonID] = useState<string | null>(null);
  const [trainingForm, setTrainingForm] = useState<TrainingFormState>(emptyTrainingForm);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(emptyLessonForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTraining = trainings.find((item) => item.id === selectedTrainingID) ?? null;
  const selectedLesson = lessons.find((item) => item.id === selectedLessonID) ?? null;
  const lessonsForSelectedTraining = lessons
    .filter((item) => item.training_id === selectedTrainingID)
    .sort((left, right) => left.sort_order - right.sort_order);

  useEffect(() => {
    void loadContent();
  }, []);

  useEffect(() => {
    if (selectedTraining) {
      setTrainingForm({
        title: selectedTraining.title,
        summary: selectedTraining.summary,
        category: selectedTraining.category,
        coverImageURL: selectedTraining.cover_image_url,
        contentURL: selectedTraining.content_url,
        status: selectedTraining.status
      });
    } else {
      setTrainingForm(emptyTrainingForm);
    }
  }, [selectedTraining]);

  useEffect(() => {
    if (selectedLesson) {
      setLessonForm({
        title: selectedLesson.title,
        body: selectedLesson.body,
        videoURL: selectedLesson.video_url ?? "",
        actionStep: selectedLesson.action_step,
        status: selectedLesson.status
      });
    } else {
      setLessonForm(emptyLessonForm);
    }
  }, [selectedLesson]);

  async function loadContent() {
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const [trainingsResult, lessonsResult] = await Promise.all([
      supabase.from("trainings").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
      supabase.from("training_lessons").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false })
    ]);

    if (trainingsResult.error) {
      setError(trainingsResult.error.message);
      setLoading(false);
      return;
    }

    if (lessonsResult.error) {
      setError(lessonsResult.error.message);
      setLoading(false);
      return;
    }

    const trainingRows = (trainingsResult.data as TrainingRecord[]) ?? [];
    const lessonRows = (lessonsResult.data as TrainingLessonRecord[]) ?? [];

    setTrainings(trainingRows);
    setLessons(lessonRows);

    if (!selectedTrainingID && trainingRows[0]) {
      setSelectedTrainingID(trainingRows[0].id);
    } else if (selectedTrainingID && !trainingRows.some((item) => item.id === selectedTrainingID)) {
      setSelectedTrainingID(trainingRows[0]?.id ?? null);
    }

    if (selectedLessonID && !lessonRows.some((item) => item.id === selectedLessonID)) {
      setSelectedLessonID(null);
    }

    setLoading(false);
  }

  function clearMessages() {
    setMessage(null);
    setError(null);
  }

  async function saveTraining(nextStatus?: "draft" | "published") {
    clearMessages();

    if (!trainingForm.title.trim()) {
      setError("Training title is required.");
      return;
    }

    if (!trainingForm.contentURL.trim()) {
      setError("Content URL is required so reps can view the Canva or hosted file.");
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload = {
      title: trainingForm.title.trim(),
      slug: slugify(trainingForm.title),
      summary: trainingForm.summary.trim(),
      category: trainingForm.category,
      cover_image_url: trainingForm.coverImageURL.trim(),
      content_url: trainingForm.contentURL.trim(),
      status: nextStatus ?? trainingForm.status
    };

    const result = selectedTraining
      ? await supabase.from("trainings").update(payload).eq("id", selectedTraining.id)
      : await supabase.from("trainings").insert({
          ...payload,
          sort_order: trainings.length ? Math.max(...trainings.map((item) => item.sort_order)) + 1 : 1
        });

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setTrainingForm(emptyTrainingForm);
    if (!selectedTraining) {
      setSelectedTrainingID(null);
    }
    setMessage(selectedTraining ? "Training updated." : "Training created.");
    await loadContent();
  }

  async function deleteTraining(id: string) {
    clearMessages();
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.from("trainings").delete().eq("id", id);
    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (selectedTrainingID === id) {
      setSelectedTrainingID(null);
      setSelectedLessonID(null);
    }

    setMessage("Training deleted.");
    await loadContent();
  }

  async function moveTraining(id: string, direction: -1 | 1) {
    const items = [...trainings].sort((left, right) => left.sort_order - right.sort_order);
    const index = items.findIndex((item) => item.id === id);
    const swapIndex = index + direction;

    if (index < 0 || swapIndex < 0 || swapIndex >= items.length) return;

    clearMessages();
    setSaving(true);
    const current = items[index];
    const target = items[swapIndex];
    const supabase = createSupabaseBrowserClient();

    const [first, second] = await Promise.all([
      supabase.from("trainings").update({ sort_order: target.sort_order }).eq("id", current.id),
      supabase.from("trainings").update({ sort_order: current.sort_order }).eq("id", target.id)
    ]);

    setSaving(false);

    if (first.error || second.error) {
      setError(first.error?.message ?? second.error?.message ?? "Unable to reorder trainings.");
      return;
    }

    await loadContent();
  }

  async function saveLesson(nextStatus?: "draft" | "published") {
    clearMessages();

    if (!selectedTrainingID) {
      setError("Select a training before creating lessons.");
      return;
    }

    if (!lessonForm.title.trim()) {
      setError("Lesson title is required.");
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload = {
      training_id: selectedTrainingID,
      title: lessonForm.title.trim(),
      body: lessonForm.body.trim(),
      video_url: lessonForm.videoURL.trim() || null,
      action_step: lessonForm.actionStep.trim(),
      status: nextStatus ?? lessonForm.status
    };

    const result = selectedLesson
      ? await supabase.from("training_lessons").update(payload).eq("id", selectedLesson.id)
      : await supabase.from("training_lessons").insert({
          ...payload,
          sort_order: lessonsForSelectedTraining.length
            ? Math.max(...lessonsForSelectedTraining.map((item) => item.sort_order)) + 1
            : 1
        });

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setLessonForm(emptyLessonForm);
    if (!selectedLesson) {
      setSelectedLessonID(null);
    }

    setMessage(selectedLesson ? "Lesson updated." : "Lesson created.");
    await loadContent();
  }

  async function deleteLesson(id: string) {
    clearMessages();
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.from("training_lessons").delete().eq("id", id);
    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (selectedLessonID === id) {
      setSelectedLessonID(null);
    }

    setMessage("Lesson deleted.");
    await loadContent();
  }

  async function moveLesson(id: string, direction: -1 | 1) {
    const items = [...lessonsForSelectedTraining];
    const index = items.findIndex((item) => item.id === id);
    const swapIndex = index + direction;

    if (index < 0 || swapIndex < 0 || swapIndex >= items.length) return;

    clearMessages();
    setSaving(true);
    const current = items[index];
    const target = items[swapIndex];
    const supabase = createSupabaseBrowserClient();

    const [first, second] = await Promise.all([
      supabase.from("training_lessons").update({ sort_order: target.sort_order }).eq("id", current.id),
      supabase.from("training_lessons").update({ sort_order: current.sort_order }).eq("id", target.id)
    ]);

    setSaving(false);

    if (first.error || second.error) {
      setError(first.error?.message ?? second.error?.message ?? "Unable to reorder lessons.");
      return;
    }

    await loadContent();
  }

  return (
    <div className="page-stack">
      {message ? <p className="form-message success">{message}</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}

      <section className="admin-manager-grid">
        <Card title="Training Modules" eyebrow="CMS">
          {loading ? (
            <p>Loading trainings...</p>
          ) : trainings.length ? (
            <div className="admin-opportunity-list">
              {trainings.map((training) => (
                <article key={training.id} className="admin-opportunity-row">
                  <div>
                    <strong>{training.title}</strong>
                    <p>{trainingCategoryLabel(training.category)}</p>
                    <small>{publicationLabel(training.status)}</small>
                  </div>
                  <div className="admin-opportunity-actions">
                    <button type="button" className="ghost-button" onClick={() => void moveTraining(training.id, -1)}>
                      Up
                    </button>
                    <button type="button" className="ghost-button" onClick={() => void moveTraining(training.id, 1)}>
                      Down
                    </button>
                    <button type="button" className="secondary-button" onClick={() => setSelectedTrainingID(training.id)}>
                      Edit
                    </button>
                    <button type="button" className="ghost-button" onClick={() => void deleteTraining(training.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>No training modules created yet.</p>
          )}
        </Card>

        <Card
          title={selectedTraining ? "Edit training" : "New training"}
          eyebrow="Training"
          action={
            selectedTraining ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setSelectedTrainingID(null);
                  setTrainingForm(emptyTrainingForm);
                }}
              >
                New
              </button>
            ) : null
          }
        >
          <div className="admin-form-grid">
            <label>
              Title
              <input
                value={trainingForm.title}
                onChange={(event) => setTrainingForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Discovery Mastery for PEO Sales"
              />
            </label>
            <label>
              Category
              <select
                value={trainingForm.category}
                onChange={(event) => setTrainingForm((current) => ({ ...current, category: event.target.value }))}
              >
                {trainingCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-form-span-2">
              Summary / Description
              <textarea
                rows={4}
                value={trainingForm.summary}
                onChange={(event) => setTrainingForm((current) => ({ ...current, summary: event.target.value }))}
                placeholder="Short premium description shown on the training card and detail page."
              />
            </label>
            <label className="admin-form-span-2">
              Cover Image URL
              <input
                value={trainingForm.coverImageURL}
                onChange={(event) => setTrainingForm((current) => ({ ...current, coverImageURL: event.target.value }))}
                placeholder="https://cdn.example.com/training-cover.jpg"
              />
            </label>
            <label className="admin-form-span-2">
              Content URL
              <input
                value={trainingForm.contentURL}
                onChange={(event) => setTrainingForm((current) => ({ ...current, contentURL: event.target.value }))}
                placeholder="https://www.canva.com/design/... or PDF URL"
              />
            </label>
            <label>
              Status
              <select
                value={trainingForm.status}
                onChange={(event) =>
                  setTrainingForm((current) => ({
                    ...current,
                    status: event.target.value as "draft" | "published"
                  }))
                }
              >
                {contentStatusOptions
                  .filter((option) => option.value !== "archived")
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="button" onClick={() => void saveTraining("draft")} disabled={saving}>
              Save Draft
            </button>
            <button type="button" onClick={() => void saveTraining("published")} disabled={saving}>
              Publish
            </button>
          </div>
        </Card>
      </section>

      <section className="admin-manager-grid">
        <Card title="Lessons" eyebrow={selectedTraining ? selectedTraining.title : "Select a training first"}>
          {selectedTraining ? (
            lessonsForSelectedTraining.length ? (
              <div className="admin-opportunity-list">
                {lessonsForSelectedTraining.map((lesson) => (
                  <article key={lesson.id} className="admin-opportunity-row">
                    <div>
                      <strong>{lesson.title}</strong>
                      <p>{lesson.video_url ? "Video lesson available" : lesson.action_step || "No action step yet."}</p>
                      <small>{publicationLabel(lesson.status)}</small>
                    </div>
                    <div className="admin-opportunity-actions">
                      <button type="button" className="ghost-button" onClick={() => void moveLesson(lesson.id, -1)}>
                        Up
                      </button>
                      <button type="button" className="ghost-button" onClick={() => void moveLesson(lesson.id, 1)}>
                        Down
                      </button>
                      <button type="button" className="secondary-button" onClick={() => setSelectedLessonID(lesson.id)}>
                        Edit
                      </button>
                      <button type="button" className="ghost-button" onClick={() => void deleteLesson(lesson.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p>No lessons created for this training yet.</p>
            )
          ) : (
            <p>Select a training to manage its optional lessons.</p>
          )}
        </Card>

        <Card
          title={selectedLesson ? "Edit lesson" : "New lesson"}
          eyebrow="Lesson"
          action={
            selectedLesson ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setSelectedLessonID(null);
                  setLessonForm(emptyLessonForm);
                }}
              >
                New
              </button>
            ) : null
          }
        >
          <div className="admin-form-grid">
            <label>
              Lesson Title
              <input
                value={lessonForm.title}
                onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="How to lead the first discovery call"
              />
            </label>
            <label>
              Status
              <select
                value={lessonForm.status}
                onChange={(event) =>
                  setLessonForm((current) => ({
                    ...current,
                    status: event.target.value as "draft" | "published"
                  }))
                }
              >
                {contentStatusOptions
                  .filter((option) => option.value !== "archived")
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>
            <label className="admin-form-span-2">
              Body
              <textarea
                rows={8}
                value={lessonForm.body}
                onChange={(event) => setLessonForm((current) => ({ ...current, body: event.target.value }))}
                placeholder="Optional text or markdown lesson content."
              />
            </label>
            <label className="admin-form-span-2">
              Video URL
              <input
                value={lessonForm.videoURL}
                onChange={(event) => setLessonForm((current) => ({ ...current, videoURL: event.target.value }))}
                placeholder="https://player.vimeo.com/... or hosted training video URL"
              />
            </label>
            <label className="admin-form-span-2">
              Action Step
              <textarea
                rows={3}
                value={lessonForm.actionStep}
                onChange={(event) => setLessonForm((current) => ({ ...current, actionStep: event.target.value }))}
                placeholder="What should the rep do after this lesson?"
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="button" onClick={() => void saveLesson("draft")} disabled={saving}>
              Save Draft
            </button>
            <button type="button" onClick={() => void saveLesson("published")} disabled={saving || !selectedTrainingID}>
              Publish
            </button>
          </div>
        </Card>
      </section>
    </div>
  );
}
