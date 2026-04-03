"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  contentStatusLabel,
  contentStatusOptions,
  parseTags,
  scriptCategoryLabel,
  scriptCategoryOptions,
  scriptTypeLabel,
  scriptTypeOptions,
  tagsToString,
  type ContentStatus,
  type ScriptRecord
} from "@/lib/cms";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ScriptFormState = {
  title: string;
  category: string;
  script_type: string;
  body: string;
  tags: string;
  is_featured: boolean;
  status: ContentStatus;
};

const emptyScriptForm: ScriptFormState = {
  title: "",
  category: scriptCategoryOptions[0]?.value ?? "phone",
  script_type: scriptTypeOptions[0]?.value ?? "cold_outreach",
  body: "",
  tags: "",
  is_featured: false,
  status: "draft"
};

export function ScriptsCMS() {
  const [scripts, setScripts] = useState<ScriptRecord[]>([]);
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [form, setForm] = useState<ScriptFormState>(emptyScriptForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedScript = scripts.find((item) => item.id === selectedID) ?? null;
  const filteredScripts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return scripts;
    return scripts.filter((script) =>
      [script.title, scriptCategoryLabel(script.category), scriptTypeLabel(script.script_type), tagsToString(script.tags)]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [scripts, search]);

  useEffect(() => {
    void loadScripts();
  }, []);

  useEffect(() => {
    if (selectedScript) {
      setForm({
        title: selectedScript.title,
        category: selectedScript.category,
        script_type: selectedScript.script_type,
        body: selectedScript.body,
        tags: tagsToString(selectedScript.tags),
        is_featured: selectedScript.is_featured,
        status: selectedScript.status
      });
    } else {
      setForm(emptyScriptForm);
    }
  }, [selectedScript]);

  async function loadScripts() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.from("scripts").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false });
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setScripts((result.data as ScriptRecord[]) ?? []);
  }

  function clearMessages() {
    setMessage(null);
    setError(null);
  }

  async function saveScript(nextStatus?: ContentStatus) {
    clearMessages();

    if (!form.title.trim()) {
      setError("Script title is required.");
      return;
    }

    if (!form.body.trim()) {
      setError("Script body is required.");
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload = {
      title: form.title.trim(),
      category: form.category,
      script_type: form.script_type,
      body: form.body.trim(),
      tags: parseTags(form.tags),
      is_featured: form.is_featured,
      status: nextStatus ?? form.status
    };

    const result = selectedScript
      ? await supabase.from("scripts").update(payload).eq("id", selectedScript.id)
      : await supabase.from("scripts").insert({
          ...payload,
          sort_order: scripts.length ? Math.max(...scripts.map((item) => item.sort_order)) + 1 : 1
        });

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSelectedID(null);
    setForm(emptyScriptForm);
    setMessage(selectedScript ? "Script updated." : "Script created.");
    await loadScripts();
  }

  async function deleteScript(id: string) {
    clearMessages();
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.from("scripts").delete().eq("id", id);
    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (selectedID === id) {
      setSelectedID(null);
      setForm(emptyScriptForm);
    }
    setMessage("Script deleted.");
    await loadScripts();
  }

  return (
    <div className="page-stack">
      {message ? <p className="form-message success">{message}</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}

      <section className="admin-manager-grid">
        <Card title="Scripts Library" eyebrow="CMS" action={<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search scripts" />}>
          {loading ? (
            <p>Loading scripts...</p>
          ) : filteredScripts.length ? (
            <div className="admin-opportunity-list">
              {filteredScripts.map((script) => (
                <article key={script.id} className="admin-opportunity-row">
                  <div>
                    <strong>{script.title}</strong>
                    <p>
                      {scriptCategoryLabel(script.category)} · {scriptTypeLabel(script.script_type)}
                    </p>
                    <small>
                      {contentStatusLabel(script.status)}
                      {script.is_featured ? " · Featured" : ""}
                    </small>
                  </div>
                  <div className="admin-opportunity-actions">
                    <button type="button" className="secondary-button" onClick={() => setSelectedID(script.id)}>
                      Edit
                    </button>
                    <button type="button" className="ghost-button" onClick={() => void deleteScript(script.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>No scripts match your current search.</p>
          )}
        </Card>

        <Card
          title={selectedScript ? "Edit script" : "New script"}
          eyebrow="Script"
          action={
            selectedScript ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setSelectedID(null);
                  setForm(emptyScriptForm);
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
                placeholder="ADP objection response"
              />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                {scriptCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select
                value={form.script_type}
                onChange={(event) => setForm((current) => ({ ...current, script_type: event.target.value }))}
              >
                {scriptTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
              Tags
              <input
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                placeholder="adp, objection, value"
              />
            </label>
            <label className="checkbox-field admin-form-span-2">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
              />
              Feature this script in the app
            </label>
            <label className="admin-form-span-2">
              Body
              <textarea
                rows={10}
                value={form.body}
                onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                placeholder="Paste the script body here."
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="button" onClick={() => void saveScript("draft")} disabled={saving}>
              Save Draft
            </button>
            <button type="button" onClick={() => void saveScript("published")} disabled={saving}>
              Publish
            </button>
            {selectedScript?.status === "published" ? (
              <button type="button" className="secondary-button" onClick={() => void saveScript("draft")} disabled={saving}>
                Unpublish
              </button>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
