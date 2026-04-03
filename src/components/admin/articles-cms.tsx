"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  articleCategoryLabel,
  articleCategoryOptions,
  contentStatusLabel,
  contentStatusOptions,
  type ArticleRecord,
  type ContentStatus
} from "@/lib/cms";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ArticleFormState = {
  title: string;
  preview: string;
  body: string;
  category: string;
  status: ContentStatus;
};

const emptyArticleForm: ArticleFormState = {
  title: "",
  preview: "",
  body: "",
  category: articleCategoryOptions[0]?.value ?? "sales_strategy",
  status: "draft"
};

export function ArticlesCMS() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleFormState>(emptyArticleForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedArticle = articles.find((item) => item.id === selectedID) ?? null;

  useEffect(() => {
    void loadArticles();
  }, []);

  useEffect(() => {
    if (selectedArticle) {
      setForm({
        title: selectedArticle.title,
        preview: selectedArticle.preview,
        body: selectedArticle.body,
        category: selectedArticle.category,
        status: selectedArticle.status
      });
    } else {
      setForm(emptyArticleForm);
    }
  }, [selectedArticle]);

  async function loadArticles() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.from("articles").select("*").order("updated_at", { ascending: false });
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setArticles((result.data as ArticleRecord[]) ?? []);
  }

  function clearMessages() {
    setMessage(null);
    setError(null);
  }

  async function saveArticle(nextStatus?: ContentStatus) {
    clearMessages();

    if (!form.title.trim()) {
      setError("Article title is required.");
      return;
    }

    if (!form.preview.trim()) {
      setError("Article preview is required.");
      return;
    }

    if (!form.body.trim()) {
      setError("Article body is required.");
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const nextStatusValue = nextStatus ?? form.status;
    const payload = {
      title: form.title.trim(),
      preview: form.preview.trim(),
      body: form.body.trim(),
      category: form.category,
      status: nextStatusValue,
      published_at: nextStatusValue === "published" ? new Date().toISOString() : null
    };

    const result = selectedArticle
      ? await supabase.from("articles").update(payload).eq("id", selectedArticle.id)
      : await supabase.from("articles").insert(payload);

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSelectedID(null);
    setForm(emptyArticleForm);
    setMessage(selectedArticle ? "Article updated." : "Article created.");
    await loadArticles();
  }

  async function deleteArticle(id: string) {
    clearMessages();
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.from("articles").delete().eq("id", id);
    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (selectedID === id) {
      setSelectedID(null);
      setForm(emptyArticleForm);
    }
    setMessage("Article deleted.");
    await loadArticles();
  }

  return (
    <div className="page-stack">
      {message ? <p className="form-message success">{message}</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}

      <section className="admin-manager-grid">
        <Card title="Articles" eyebrow="CMS">
          {loading ? (
            <p>Loading articles...</p>
          ) : articles.length ? (
            <div className="admin-opportunity-list">
              {articles.map((article) => (
                <article key={article.id} className="admin-opportunity-row">
                  <div>
                    <strong>{article.title}</strong>
                    <p>{articleCategoryLabel(article.category)}</p>
                    <small>{contentStatusLabel(article.status)}</small>
                  </div>
                  <div className="admin-opportunity-actions">
                    <button type="button" className="secondary-button" onClick={() => setSelectedID(article.id)}>
                      Edit
                    </button>
                    <button type="button" className="ghost-button" onClick={() => void deleteArticle(article.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>No articles created yet.</p>
          )}
        </Card>

        <Card
          title={selectedArticle ? "Edit article" : "New article"}
          eyebrow="Article"
          action={
            selectedArticle ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setSelectedID(null);
                  setForm(emptyArticleForm);
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
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="What high-performing reps do before discovery"
              />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                {articleCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-form-span-2">
              Preview
              <textarea
                rows={3}
                value={form.preview}
                onChange={(event) => setForm((current) => ({ ...current, preview: event.target.value }))}
                placeholder="Short article preview used in the feed."
              />
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ContentStatus }))}
              >
                {contentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-form-span-2">
              Body
              <textarea
                rows={12}
                value={form.body}
                onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                placeholder="Full article body."
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="button" onClick={() => void saveArticle("draft")} disabled={saving}>
              Save Draft
            </button>
            <button type="button" onClick={() => void saveArticle("published")} disabled={saving}>
              Publish
            </button>
            {selectedArticle?.status === "published" ? (
              <button type="button" className="secondary-button" onClick={() => void saveArticle("draft")} disabled={saving}>
                Unpublish
              </button>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
