"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  contentStatusLabel,
  contentStatusOptions,
  type ContentStatus,
  type QuizAnswerRecord,
  type QuizQuestionRecord,
  type QuizRecord,
  type TrainingLessonRecord,
  type TrainingRecord
} from "@/lib/cms";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type QuizFormState = {
  lesson_id: string;
  title: string;
  status: ContentStatus;
};

type QuestionFormState = {
  prompt: string;
};

type AnswerFormState = {
  answer_text: string;
  is_correct: boolean;
};

const emptyQuizForm: QuizFormState = {
  lesson_id: "",
  title: "",
  status: "draft"
};

const emptyQuestionForm: QuestionFormState = {
  prompt: ""
};

const emptyAnswerForm: AnswerFormState = {
  answer_text: "",
  is_correct: false
};

export function QuizzesCMS() {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [lessons, setLessons] = useState<TrainingLessonRecord[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [questions, setQuestions] = useState<QuizQuestionRecord[]>([]);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [selectedQuizID, setSelectedQuizID] = useState<string | null>(null);
  const [selectedQuestionID, setSelectedQuestionID] = useState<string | null>(null);
  const [selectedAnswerID, setSelectedAnswerID] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState<QuizFormState>(emptyQuizForm);
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(emptyQuestionForm);
  const [answerForm, setAnswerForm] = useState<AnswerFormState>(emptyAnswerForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedQuiz = quizzes.find((item) => item.id === selectedQuizID) ?? null;
  const selectedQuestion = questions.find((item) => item.id === selectedQuestionID) ?? null;
  const selectedAnswer = answers.find((item) => item.id === selectedAnswerID) ?? null;
  const questionsForSelectedQuiz = questions.filter((item) => item.quiz_id === selectedQuizID).sort((a, b) => a.sort_order - b.sort_order);
  const answersForSelectedQuestion = answers.filter((item) => item.question_id === selectedQuestionID).sort((a, b) => a.sort_order - b.sort_order);

  useEffect(() => {
    void loadContent();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      setQuizForm({
        lesson_id: selectedQuiz.lesson_id,
        title: selectedQuiz.title,
        status: selectedQuiz.status
      });
    } else {
      setQuizForm({
        ...emptyQuizForm,
        lesson_id: lessons[0]?.id ?? ""
      });
    }
  }, [selectedQuiz, lessons]);

  useEffect(() => {
    if (selectedQuestion) {
      setQuestionForm({ prompt: selectedQuestion.prompt });
    } else {
      setQuestionForm(emptyQuestionForm);
    }
    setSelectedAnswerID(null);
  }, [selectedQuestion]);

  useEffect(() => {
    if (selectedAnswer) {
      setAnswerForm({
        answer_text: selectedAnswer.answer_text,
        is_correct: selectedAnswer.is_correct
      });
    } else {
      setAnswerForm(emptyAnswerForm);
    }
  }, [selectedAnswer]);

  async function loadContent() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const [trainingsResult, lessonsResult, quizzesResult, questionsResult, answersResult] = await Promise.all([
      supabase.from("trainings").select("*").order("sort_order", { ascending: true }),
      supabase.from("training_lessons").select("*").order("sort_order", { ascending: true }),
      supabase.from("quizzes").select("*").order("sort_order", { ascending: true }),
      supabase.from("quiz_questions").select("*").order("sort_order", { ascending: true }),
      supabase.from("quiz_answers").select("*").order("sort_order", { ascending: true })
    ]);

    const failing = [trainingsResult, lessonsResult, quizzesResult, questionsResult, answersResult].find((result) => result.error);
    if (failing?.error) {
      setLoading(false);
      setError(failing.error.message);
      return;
    }

    setTrainings((trainingsResult.data as TrainingRecord[]) ?? []);
    setLessons((lessonsResult.data as TrainingLessonRecord[]) ?? []);
    setQuizzes((quizzesResult.data as QuizRecord[]) ?? []);
    setQuestions((questionsResult.data as QuizQuestionRecord[]) ?? []);
    setAnswers((answersResult.data as QuizAnswerRecord[]) ?? []);
    setLoading(false);
  }

  function clearMessages() {
    setMessage(null);
    setError(null);
  }

  async function saveQuiz(nextStatus?: ContentStatus) {
    clearMessages();

    if (!quizForm.lesson_id) {
      setError("Choose a lesson for this quiz.");
      return;
    }
    if (!quizForm.title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload = {
      lesson_id: quizForm.lesson_id,
      title: quizForm.title.trim(),
      status: nextStatus ?? quizForm.status
    };
    const result = selectedQuiz
      ? await supabase.from("quizzes").update(payload).eq("id", selectedQuiz.id)
      : await supabase.from("quizzes").insert({
          ...payload,
          sort_order: quizzes.length ? Math.max(...quizzes.map((item) => item.sort_order)) + 1 : 1
        });
    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSelectedQuizID(null);
    setSelectedQuestionID(null);
    setMessage(selectedQuiz ? "Quiz updated." : "Quiz created.");
    await loadContent();
  }

  async function saveQuestion() {
    clearMessages();

    if (!selectedQuizID) {
      setError("Select a quiz before adding questions.");
      return;
    }
    if (!questionForm.prompt.trim()) {
      setError("Question prompt is required.");
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload = {
      quiz_id: selectedQuizID,
      prompt: questionForm.prompt.trim()
    };
    const result = selectedQuestion
      ? await supabase.from("quiz_questions").update(payload).eq("id", selectedQuestion.id)
      : await supabase.from("quiz_questions").insert({
          ...payload,
          sort_order: questionsForSelectedQuiz.length ? Math.max(...questionsForSelectedQuiz.map((item) => item.sort_order)) + 1 : 1
        });
    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSelectedQuestionID(null);
    setQuestionForm(emptyQuestionForm);
    setMessage(selectedQuestion ? "Question updated." : "Question added.");
    await loadContent();
  }

  async function deleteRow(table: "quizzes" | "quiz_questions" | "quiz_answers", id: string) {
    clearMessages();
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.from(table).delete().eq("id", id);
    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (table === "quizzes" && selectedQuizID === id) {
      setSelectedQuizID(null);
      setSelectedQuestionID(null);
      setSelectedAnswerID(null);
    }
    if (table === "quiz_questions" && selectedQuestionID === id) {
      setSelectedQuestionID(null);
      setSelectedAnswerID(null);
    }
    if (table === "quiz_answers" && selectedAnswerID === id) {
      setSelectedAnswerID(null);
    }

    setMessage("Item deleted.");
    await loadContent();
  }

  async function moveQuestion(id: string, direction: -1 | 1) {
    const items = [...questionsForSelectedQuiz];
    const index = items.findIndex((item) => item.id === id);
    const swapIndex = index + direction;

    if (index < 0 || swapIndex < 0 || swapIndex >= items.length) return;

    clearMessages();
    setSaving(true);
    const current = items[index];
    const target = items[swapIndex];
    const supabase = createSupabaseBrowserClient();
    const [first, second] = await Promise.all([
      supabase.from("quiz_questions").update({ sort_order: target.sort_order }).eq("id", current.id),
      supabase.from("quiz_questions").update({ sort_order: current.sort_order }).eq("id", target.id)
    ]);
    setSaving(false);

    if (first.error || second.error) {
      setError(first.error?.message ?? second.error?.message ?? "Unable to reorder quiz questions.");
      return;
    }

    await loadContent();
  }

  async function saveAnswer() {
    clearMessages();

    if (!selectedQuestionID) {
      setError("Select a question before adding answers.");
      return;
    }
    if (!answerForm.answer_text.trim()) {
      setError("Answer text is required.");
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload = {
      question_id: selectedQuestionID,
      answer_text: answerForm.answer_text.trim(),
      is_correct: answerForm.is_correct
    };
    const result = selectedAnswer
      ? await supabase.from("quiz_answers").update(payload).eq("id", selectedAnswer.id)
      : await supabase.from("quiz_answers").insert({
          ...payload,
          sort_order: answersForSelectedQuestion.length ? Math.max(...answersForSelectedQuestion.map((item) => item.sort_order)) + 1 : 1
        });
    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSelectedAnswerID(null);
    setAnswerForm(emptyAnswerForm);
    setMessage(selectedAnswer ? "Answer updated." : "Answer added.");
    await loadContent();
  }

  return (
    <div className="page-stack">
      {message ? <p className="form-message success">{message}</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}

      <section className="admin-manager-grid">
        <Card title="Quizzes" eyebrow="CMS">
          {loading ? (
            <p>Loading quizzes...</p>
          ) : quizzes.length ? (
            <div className="admin-opportunity-list">
              {quizzes.map((quiz) => {
                const lesson = lessons.find((item) => item.id === quiz.lesson_id);
                const training = trainings.find((item) => item.id === lesson?.training_id);

                return (
                  <article key={quiz.id} className="admin-opportunity-row">
                    <div>
                      <strong>{quiz.title}</strong>
                      <p>
                        {training?.title ?? "Training"} · {lesson?.title ?? "Lesson"}
                      </p>
                      <small>{contentStatusLabel(quiz.status)}</small>
                    </div>
                    <div className="admin-opportunity-actions">
                      <button type="button" className="secondary-button" onClick={() => setSelectedQuizID(quiz.id)}>
                        Edit
                      </button>
                      <button type="button" className="ghost-button" onClick={() => void deleteRow("quizzes", quiz.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p>No quizzes created yet.</p>
          )}
        </Card>

        <Card title={selectedQuiz ? "Edit quiz" : "New quiz"} eyebrow="Quiz">
          <div className="admin-form-grid">
            <label>
              Lesson
              <select
                value={quizForm.lesson_id}
                onChange={(event) => setQuizForm((current) => ({ ...current, lesson_id: event.target.value }))}
              >
                <option value="">Select a lesson</option>
                {lessons.map((lesson) => {
                  const training = trainings.find((item) => item.id === lesson.training_id);
                  return (
                    <option key={lesson.id} value={lesson.id}>
                      {(training?.title ?? "Training") + " · " + lesson.title}
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              Status
              <select
                value={quizForm.status}
                onChange={(event) => setQuizForm((current) => ({ ...current, status: event.target.value as ContentStatus }))}
              >
                {contentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-form-span-2">
              Quiz Title
              <input
                value={quizForm.title}
                onChange={(event) => setQuizForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Quiz: Discovery Questions That Work"
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="button" onClick={() => void saveQuiz("draft")} disabled={saving}>
              Save Draft
            </button>
            <button type="button" onClick={() => void saveQuiz("published")} disabled={saving}>
              Publish
            </button>
            {selectedQuiz?.status === "published" ? (
              <button type="button" className="secondary-button" onClick={() => void saveQuiz("draft")} disabled={saving}>
                Unpublish
              </button>
            ) : null}
          </div>
        </Card>
      </section>

      <section className="admin-manager-grid">
        <Card title="Questions" eyebrow={selectedQuiz ? selectedQuiz.title : "Select a quiz first"}>
          {selectedQuiz ? (
            questionsForSelectedQuiz.length ? (
              <div className="admin-opportunity-list">
                {questionsForSelectedQuiz.map((question) => (
                  <article key={question.id} className="admin-opportunity-row">
                    <div>
                      <strong>{question.prompt}</strong>
                      <small>{answers.filter((item) => item.question_id === question.id).length} answers</small>
                    </div>
                    <div className="admin-opportunity-actions">
                      <button type="button" className="ghost-button" onClick={() => void moveQuestion(question.id, -1)}>
                        Up
                      </button>
                      <button type="button" className="ghost-button" onClick={() => void moveQuestion(question.id, 1)}>
                        Down
                      </button>
                      <button type="button" className="secondary-button" onClick={() => setSelectedQuestionID(question.id)}>
                        Edit
                      </button>
                      <button type="button" className="ghost-button" onClick={() => void deleteRow("quiz_questions", question.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p>No questions created for this quiz yet.</p>
            )
          ) : (
            <p>Select a quiz to manage its questions.</p>
          )}
        </Card>

        <Card title={selectedQuestion ? "Edit question" : "New question"} eyebrow="Question">
          <div className="admin-form-grid">
            <label className="admin-form-span-2">
              Prompt
              <textarea
                rows={4}
                value={questionForm.prompt}
                onChange={(event) => setQuestionForm({ prompt: event.target.value })}
                placeholder="What is the main purpose of discovery?"
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="button" onClick={() => void saveQuestion()} disabled={saving || !selectedQuizID}>
              Save Question
            </button>
          </div>
        </Card>
      </section>

      <Card title="Answer Choices" eyebrow={selectedQuestion ? "Question Answers" : "Select a question first"}>
        {selectedQuestion ? (
          <>
            {answersForSelectedQuestion.length ? (
              <div className="admin-opportunity-list">
                {answersForSelectedQuestion.map((answer) => (
                <article key={answer.id} className="admin-opportunity-row">
                  <div>
                    <strong>{answer.answer_text}</strong>
                    <small>{answer.is_correct ? "Correct answer" : "Distractor"}</small>
                  </div>
                  <div className="admin-opportunity-actions">
                    <button type="button" className="secondary-button" onClick={() => setSelectedAnswerID(answer.id)}>
                      Edit
                    </button>
                    <button type="button" className="ghost-button" onClick={() => void deleteRow("quiz_answers", answer.id)}>
                      Delete
                    </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p>No answers created yet.</p>
            )}
              <div className="admin-form-actions">
                {selectedAnswer ? (
                  <button type="button" className="ghost-button" onClick={() => setSelectedAnswerID(null)}>
                    New Answer
                  </button>
                ) : null}
              </div>
            <div className="admin-form-grid">
              <label className="admin-form-span-2">
                Answer text
                <input
                  value={answerForm.answer_text}
                  onChange={(event) => setAnswerForm((current) => ({ ...current, answer_text: event.target.value }))}
                  placeholder="Build trust and uncover risk."
                />
              </label>
              <label className="checkbox-field admin-form-span-2">
                <input
                  type="checkbox"
                  checked={answerForm.is_correct}
                  onChange={(event) => setAnswerForm((current) => ({ ...current, is_correct: event.target.checked }))}
                />
                Mark as the correct answer
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="button" onClick={() => void saveAnswer()} disabled={saving}>
                {selectedAnswer ? "Save Answer" : "Add Answer"}
              </button>
            </div>
          </>
        ) : (
          <p>Select a question to manage its answer choices.</p>
        )}
      </Card>
    </div>
  );
}
