"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PipelineStage = "new" | "discovery" | "quoted" | "proposal" | "won" | "lost";

type PipelineRecord = {
  id: string;
  owner_id: string;
  account_name: string;
  contact_name: string;
  contact_email: string;
  stage: PipelineStage;
  source: string;
  estimated_payroll: number | null;
  estimated_headcount: number | null;
  estimated_value: number | null;
  close_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

type PipelineFormState = {
  accountName: string;
  contactName: string;
  contactEmail: string;
  stage: PipelineStage;
  source: string;
  estimatedPayroll: string;
  estimatedHeadcount: string;
  estimatedValue: string;
  closeDate: string;
  notes: string;
};

const initialFormState: PipelineFormState = {
  accountName: "",
  contactName: "",
  contactEmail: "",
  stage: "new",
  source: "",
  estimatedPayroll: "",
  estimatedHeadcount: "",
  estimatedValue: "",
  closeDate: "",
  notes: ""
};

const stageOptions: Array<{ value: PipelineStage; label: string }> = [
  { value: "new", label: "New" },
  { value: "discovery", label: "Discovery" },
  { value: "quoted", label: "Quoted" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" }
];

type PipelineManagerProps = {
  mode?: "shared" | "admin";
};

export function PipelineManager({ mode = "shared" }: PipelineManagerProps) {
  const supabase = createSupabaseBrowserClient();
  const [records, setRecords] = useState<PipelineRecord[]>([]);
  const [form, setForm] = useState<PipelineFormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadCurrentUser() {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) throw new Error(userError.message);

    setCurrentUserId(user?.id ?? null);
  }

  async function loadPipeline() {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("opportunities")
      .select(
        "id,owner_id,account_name,contact_name,contact_email,stage,source,estimated_payroll,estimated_headcount,estimated_value,close_date,notes,created_at,updated_at"
      )
      .order("updated_at", { ascending: false });

    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setRecords((data as PipelineRecord[]) || []);
  }

  useEffect(() => {
    async function initialize() {
      try {
        await loadCurrentUser();
        await loadPipeline();
      } catch (loadError) {
        setLoading(false);
        setError(loadError instanceof Error ? loadError.message : "Unable to load pipeline records.");
      }
    }

    initialize();
  }, []);

  function resetForm() {
    setForm(initialFormState);
    setEditingId(null);
  }

  function beginEdit(record: PipelineRecord) {
    setEditingId(record.id);
    setMessage(null);
    setError(null);
    setForm({
      accountName: record.account_name,
      contactName: record.contact_name,
      contactEmail: record.contact_email,
      stage: record.stage,
      source: record.source,
      estimatedPayroll: record.estimated_payroll?.toString() ?? "",
      estimatedHeadcount: record.estimated_headcount?.toString() ?? "",
      estimatedValue: record.estimated_value?.toString() ?? "",
      closeDate: record.close_date ?? "",
      notes: record.notes
    });
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      owner_id: currentUserId,
      account_name: String(formData.get("accountName") || "").trim(),
      contact_name: String(formData.get("contactName") || "").trim(),
      contact_email: String(formData.get("contactEmail") || "").trim(),
      stage: String(formData.get("stage") || "new") as PipelineStage,
      source: String(formData.get("source") || "").trim(),
      estimated_payroll: formData.get("estimatedPayroll") ? Number(formData.get("estimatedPayroll")) : null,
      estimated_headcount: formData.get("estimatedHeadcount") ? Number(formData.get("estimatedHeadcount")) : null,
      estimated_value: formData.get("estimatedValue") ? Number(formData.get("estimatedValue")) : null,
      close_date: String(formData.get("closeDate") || "").trim() || null,
      notes: String(formData.get("notes") || "").trim()
    };

    if (!payload.account_name) {
      setSaving(false);
      setError("Account name is required.");
      return;
    }

    if (!currentUserId) {
      setSaving(false);
      setError("You must be logged in to save a pipeline record.");
      return;
    }

    const query = editingId
      ? supabase.from("opportunities").update(payload).eq("id", editingId)
      : supabase.from("opportunities").insert(payload);

    const { error: saveError } = await query;

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    resetForm();
    setMessage(editingId ? "Pipeline record updated." : "Deal added to pipeline.");
    await loadPipeline();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this pipeline record?");
    if (!confirmed) return;

    setError(null);
    setMessage(null);

    const { error: deleteError } = await supabase.from("opportunities").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingId === id) resetForm();

    setMessage("Pipeline record removed.");
    await loadPipeline();
  }

  return (
    <div className="page-stack">
      <section className="admin-manager-grid">
        <section className="card">
          <div className="card-head">
            <div>
              <p className="eyebrow">{editingId ? "Edit Pipeline Record" : "Add Deal"}</p>
              <h3>{editingId ? "Update deal in pipeline" : "Create a new pipeline record"}</h3>
            </div>
          </div>
          <form className="admin-form-grid" action={handleSubmit}>
            <label>
              Account name
              <input
                name="accountName"
                value={form.accountName}
                onChange={(event) => setForm((current) => ({ ...current, accountName: event.target.value }))}
                required
              />
            </label>
            <label>
              Contact name
              <input
                name="contactName"
                value={form.contactName}
                onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))}
                placeholder="Decision maker"
              />
            </label>
            <label>
              Contact email
              <input
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))}
                placeholder="contact@account.com"
              />
            </label>
            <label>
              Stage
              <select
                name="stage"
                value={form.stage}
                onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value as PipelineStage }))}
              >
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Source
              <input
                name="source"
                value={form.source}
                onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
                placeholder="Referral, outbound, partner"
              />
            </label>
            <label>
              Estimated payroll
              <input
                name="estimatedPayroll"
                type="number"
                value={form.estimatedPayroll}
                onChange={(event) => setForm((current) => ({ ...current, estimatedPayroll: event.target.value }))}
                placeholder="750000"
              />
            </label>
            <label>
              Estimated headcount
              <input
                name="estimatedHeadcount"
                type="number"
                value={form.estimatedHeadcount}
                onChange={(event) => setForm((current) => ({ ...current, estimatedHeadcount: event.target.value }))}
                placeholder="85"
              />
            </label>
            <label>
              Estimated value
              <input
                name="estimatedValue"
                type="number"
                value={form.estimatedValue}
                onChange={(event) => setForm((current) => ({ ...current, estimatedValue: event.target.value }))}
                placeholder="25000"
              />
            </label>
            <label>
              Close date
              <input
                name="closeDate"
                type="date"
                value={form.closeDate}
                onChange={(event) => setForm((current) => ({ ...current, closeDate: event.target.value }))}
              />
            </label>
            <label className="admin-form-span">
              Notes
              <textarea
                name="notes"
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Important context, next steps, or rep notes"
              />
            </label>
            {error ? <p className="form-message error">{error}</p> : null}
            {message ? <p className="form-message success">{message}</p> : null}
            <div className="admin-form-actions">
              <button type="submit" disabled={saving}>
                {saving ? (editingId ? "Saving..." : "Creating...") : editingId ? "Save Changes" : "Add Deal"}
              </button>
              {editingId ? (
                <button type="button" className="secondary-button" onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <p className="eyebrow">{mode === "admin" ? "Pipeline Oversight" : "My Pipeline"}</p>
              <h3>{mode === "admin" ? "Current pipeline records" : "Your active pipeline"}</h3>
            </div>
          </div>
          {loading ? (
            <p className="helper-text">Loading pipeline...</p>
          ) : records.length ? (
            <div className="admin-opportunity-list">
              {records.map((record) => (
                <article key={record.id} className="admin-opportunity-row">
                  <div>
                    <strong>{record.account_name}</strong>
                    <p>
                      {labelForStage(record.stage)}
                      {record.source ? ` · ${record.source}` : ""}
                    </p>
                    <small>
                      {record.contact_name ? `${record.contact_name}` : "No contact"}
                      {record.contact_email ? ` · ${record.contact_email}` : ""}
                    </small>
                    <small>
                      {record.estimated_value ? `$${record.estimated_value.toLocaleString()}` : "No value"}
                      {record.estimated_headcount ? ` · ${record.estimated_headcount} lives` : ""}
                      {record.estimated_payroll ? ` · $${record.estimated_payroll.toLocaleString()} payroll` : ""}
                      {record.close_date ? ` · closes ${record.close_date}` : ""}
                    </small>
                  </div>
                  <div className="admin-opportunity-actions">
                    <button type="button" className="secondary-button" onClick={() => beginEdit(record)}>
                      Edit
                    </button>
                    <button type="button" className="secondary-button" onClick={() => handleDelete(record.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="helper-text">No deals in the pipeline yet.</p>
          )}
        </section>
      </section>
    </div>
  );
}

function labelForStage(stage: PipelineStage) {
  return stageOptions.find((option) => option.value === stage)?.label ?? stage;
}
