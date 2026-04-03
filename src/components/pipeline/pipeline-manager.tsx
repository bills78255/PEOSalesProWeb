"use client";

import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PipelineStage = "new" | "qualified" | "proposal" | "closed_won" | "closed_lost";

type PipelineRecord = {
  id: string;
  owner_id: string | null;
  deal_name: string;
  stage: PipelineStage;
  crm_link: string;
  estimated_commission: number | null;
  referral_source: string;
  created_at: string;
  updated_at: string;
};

type ClosedDealAnalysisRecord = {
  id: string;
  deal_id: string;
  industry: string;
  company_size: string;
  sales_cycle_days: number | null;
  number_of_meetings: number | null;
  number_of_stakeholders: number | null;
  competitors_involved: string[];
  winner: string;
  primary_win_reason: string;
  win_notes: string;
  top_objections: string[];
  referral_type: string;
  referral_name: string;
};

type PipelineFormState = {
  dealName: string;
  stage: PipelineStage;
  crmLink: string;
  estimatedCommission: string;
  referralSource: string;
};

type AnalysisFormState = {
  industry: string;
  companySize: string;
  salesCycleDays: string;
  numberOfMeetings: string;
  numberOfStakeholders: string;
  competitorsInvolved: string[];
  winner: string;
  primaryWinReason: string;
  winNotes: string;
  topObjections: string[];
  referralType: string;
  referralName: string;
};

const initialFormState: PipelineFormState = {
  dealName: "",
  stage: "new",
  crmLink: "",
  estimatedCommission: "",
  referralSource: ""
};

const initialAnalysisState: AnalysisFormState = {
  industry: "",
  companySize: "",
  salesCycleDays: "",
  numberOfMeetings: "",
  numberOfStakeholders: "",
  competitorsInvolved: [],
  winner: "us",
  primaryWinReason: "",
  winNotes: "",
  topObjections: [],
  referralType: "",
  referralName: ""
};

const stageOptions: Array<{ value: PipelineStage; label: string }> = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" }
];

const industryOptions = [
  "Construction",
  "Manufacturing",
  "Healthcare",
  "Professional Services",
  "Hospitality",
  "Transportation",
  "Retail",
  "Other"
];

const companySizeOptions = [
  "1-24 employees",
  "25-49 employees",
  "50-99 employees",
  "100-249 employees",
  "250+ employees",
  "Payroll under $500k",
  "$500k-$2M payroll",
  "$2M+ payroll"
];

const competitorOptions = ["ADP", "Paychex", "Insperity", "TriNet", "Justworks", "Other"];
const winReasonOptions = [
  "Better pricing",
  "Stronger service model",
  "Faster implementation",
  "Workers' comp solution",
  "Benefits value",
  "Referral trust",
  "Stronger relationship"
];
const objectionOptions = [
  "Happy with current provider",
  "Price",
  "Timing",
  "Switching risk",
  "Need more internal buy-in",
  "Already using ADP",
  "Benefits disruption"
];
const referralTypeOptions = ["CPA", "Broker", "Insurance Agent", "Bank", "Private Equity", "Client Referral", "Other"];

type PipelineManagerProps = {
  mode?: "shared" | "admin";
};

function toggleSelection(items: string[], value: string) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export function PipelineManager({ mode = "shared" }: PipelineManagerProps) {
  const supabase = createSupabaseBrowserClient();
  const [records, setRecords] = useState<PipelineRecord[]>([]);
  const [form, setForm] = useState<PipelineFormState>(initialFormState);
  const [analysisForm, setAnalysisForm] = useState<AnalysisFormState>(initialAnalysisState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisDeal, setAnalysisDeal] = useState<PipelineRecord | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const sortedRecords = useMemo(
    () => [...records].sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()),
    [records]
  );

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
      .select("id,owner_id,deal_name,stage,crm_link,estimated_commission,referral_source,created_at,updated_at")
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

    void initialize();
  }, []);

  function resetForm() {
    setForm(initialFormState);
    setEditingId(null);
  }

  function resetAnalysis() {
    setAnalysisForm(initialAnalysisState);
    setAnalysisDeal(null);
    setAnalysisOpen(false);
  }

  function beginEdit(record: PipelineRecord) {
    setEditingId(record.id);
    setMessage(null);
    setError(null);
    setForm({
      dealName: record.deal_name,
      stage: record.stage,
      crmLink: record.crm_link,
      estimatedCommission: record.estimated_commission?.toString() ?? "",
      referralSource: record.referral_source
    });
  }

  async function openAnalyzer(deal: PipelineRecord) {
    setAnalysisDeal(deal);
    setAnalysisOpen(true);
    setError(null);

    const { data, error: analysisError } = await supabase
      .from("closed_deal_analysis")
      .select("*")
      .eq("deal_id", deal.id)
      .maybeSingle();

    if (analysisError) {
      setError(analysisError.message);
      setAnalysisForm(initialAnalysisState);
      return;
    }

    if (!data) {
      setAnalysisForm({
        ...initialAnalysisState,
        referralName: deal.referral_source
      });
      return;
    }

    const analysis = data as ClosedDealAnalysisRecord;
    setAnalysisForm({
      industry: analysis.industry,
      companySize: analysis.company_size,
      salesCycleDays: analysis.sales_cycle_days?.toString() ?? "",
      numberOfMeetings: analysis.number_of_meetings?.toString() ?? "",
      numberOfStakeholders: analysis.number_of_stakeholders?.toString() ?? "",
      competitorsInvolved: analysis.competitors_involved ?? [],
      winner: analysis.winner,
      primaryWinReason: analysis.primary_win_reason,
      winNotes: analysis.win_notes,
      topObjections: analysis.top_objections ?? [],
      referralType: analysis.referral_type,
      referralName: analysis.referral_name
    });
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      owner_id: currentUserId,
      deal_name: String(formData.get("dealName") || "").trim(),
      stage: String(formData.get("stage") || "new") as PipelineStage,
      crm_link: String(formData.get("crmLink") || "").trim(),
      estimated_commission: formData.get("estimatedCommission") ? Number(formData.get("estimatedCommission")) : null,
      referral_source: String(formData.get("referralSource") || "").trim()
    };

    if (!payload.deal_name) {
      setSaving(false);
      setError("Deal name is required.");
      return;
    }

    if (!currentUserId) {
      setSaving(false);
      setError("You must be logged in to save a pipeline record.");
      return;
    }

    const query = editingId
      ? supabase.from("opportunities").update(payload).eq("id", editingId).select("*").single()
      : supabase.from("opportunities").insert(payload).select("*").single();

    const { data, error: saveError } = await query;

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    const savedDeal = data as PipelineRecord;
    resetForm();
    setMessage(editingId ? "Pipeline deal updated." : "Deal added to pipeline.");
    await loadPipeline();

    if (savedDeal.stage === "closed_won") {
      await openAnalyzer(savedDeal);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this pipeline deal?");
    if (!confirmed) return;

    setError(null);
    setMessage(null);

    const { error: deleteError } = await supabase.from("opportunities").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingId === id) resetForm();

    setMessage("Pipeline deal removed.");
    await loadPipeline();
  }

  async function handleAnalysisSave() {
    if (!analysisDeal) return;

    setSavingAnalysis(true);
    setError(null);
    setMessage(null);

    const payload = {
      deal_id: analysisDeal.id,
      industry: analysisForm.industry,
      company_size: analysisForm.companySize,
      sales_cycle_days: analysisForm.salesCycleDays ? Number(analysisForm.salesCycleDays) : null,
      number_of_meetings: analysisForm.numberOfMeetings ? Number(analysisForm.numberOfMeetings) : null,
      number_of_stakeholders: analysisForm.numberOfStakeholders ? Number(analysisForm.numberOfStakeholders) : null,
      competitors_involved: analysisForm.competitorsInvolved,
      winner: analysisForm.winner,
      primary_win_reason: analysisForm.primaryWinReason,
      win_notes: analysisForm.winNotes,
      top_objections: analysisForm.topObjections,
      referral_type: analysisForm.referralType,
      referral_name: analysisForm.referralName
    };

    const { error: saveError } = await supabase.from("closed_deal_analysis").upsert(payload, { onConflict: "deal_id" });

    setSavingAnalysis(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setMessage("Closed deal analysis saved.");
    resetAnalysis();
  }

  return (
    <div className="page-stack">
      <section className="admin-manager-grid">
        <section className="card">
          <div className="card-head">
            <div>
              <p className="eyebrow">{editingId ? "Edit Deal" : "Add Deal"}</p>
              <h3>{editingId ? "Update lightweight pipeline deal" : "Create a new pipeline deal"}</h3>
            </div>
          </div>
          <form className="admin-form-grid" action={handleSubmit}>
            <label>
              Deal name
              <input
                name="dealName"
                value={form.dealName}
                onChange={(event) => setForm((current) => ({ ...current, dealName: event.target.value }))}
                required
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
              CRM link
              <input
                name="crmLink"
                type="url"
                value={form.crmLink}
                onChange={(event) => setForm((current) => ({ ...current, crmLink: event.target.value }))}
                placeholder="https://hubspot.com/..."
              />
            </label>
            <label>
              Estimated commission
              <input
                name="estimatedCommission"
                type="number"
                value={form.estimatedCommission}
                onChange={(event) => setForm((current) => ({ ...current, estimatedCommission: event.target.value }))}
                placeholder="2500"
              />
            </label>
            <label className="admin-form-span-2">
              Referral source
              <input
                name="referralSource"
                value={form.referralSource}
                onChange={(event) => setForm((current) => ({ ...current, referralSource: event.target.value }))}
                placeholder="CPA partner, broker, outbound, client referral"
              />
            </label>

            <div className="admin-form-actions admin-form-span-2">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Deal" : "Save Deal"}
              </button>
              {editingId ? (
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <p className="eyebrow">{mode === "admin" ? "Admin Pipeline" : "Your Pipeline"}</p>
              <h3>Active deal tracker</h3>
            </div>
          </div>
          {loading ? <p>Loading pipeline...</p> : null}
          {error ? <p className="form-message error">{error}</p> : null}
          {message ? <p className="form-message success">{message}</p> : null}
          {!loading && !sortedRecords.length ? (
            <p className="helper-text">No deals yet. Start by adding your first lightweight pipeline record.</p>
          ) : (
            <div className="admin-opportunity-list">
              {sortedRecords.map((record) => (
                <article key={record.id} className="admin-opportunity-row">
                  <div>
                    <strong>{record.deal_name}</strong>
                    <p>
                      {stageOptions.find((option) => option.value === record.stage)?.label ?? record.stage}
                      {record.referral_source ? ` · ${record.referral_source}` : ""}
                    </p>
                    <small>
                      {record.estimated_commission != null
                        ? `Est. commission $${record.estimated_commission.toLocaleString()}`
                        : "No estimated commission yet"}
                    </small>
                  </div>
                  <div className="admin-opportunity-actions">
                    {record.crm_link ? (
                      <a href={record.crm_link} target="_blank" rel="noreferrer" className="ghost-link">
                        CRM
                      </a>
                    ) : null}
                    <button type="button" className="secondary-button" onClick={() => beginEdit(record)}>
                      Edit
                    </button>
                    {record.stage === "closed_won" ? (
                      <button type="button" className="ghost-button" onClick={() => void openAnalyzer(record)}>
                        Analyze
                      </button>
                    ) : null}
                    <button type="button" className="ghost-button" onClick={() => void handleDelete(record.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {analysisOpen && analysisDeal ? (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="card-head">
              <div>
                <p className="eyebrow">Closed Deal Analyzer</p>
                <h3>{analysisDeal.deal_name}</h3>
              </div>
              <button type="button" className="ghost-button" onClick={resetAnalysis}>
                Close
              </button>
            </div>

            <div className="admin-form-grid">
              <label>
                Industry
                <select
                  value={analysisForm.industry}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, industry: event.target.value }))}
                >
                  <option value="">Select industry</option>
                  {industryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Company size
                <select
                  value={analysisForm.companySize}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, companySize: event.target.value }))}
                >
                  <option value="">Select size</option>
                  {companySizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sales cycle days
                <input
                  type="number"
                  value={analysisForm.salesCycleDays}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, salesCycleDays: event.target.value }))}
                  placeholder="45"
                />
              </label>
              <label>
                Number of meetings
                <input
                  type="number"
                  value={analysisForm.numberOfMeetings}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, numberOfMeetings: event.target.value }))}
                  placeholder="3"
                />
              </label>
              <label>
                Stakeholders
                <input
                  type="number"
                  value={analysisForm.numberOfStakeholders}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, numberOfStakeholders: event.target.value }))}
                  placeholder="2"
                />
              </label>
              <label>
                Primary win reason
                <select
                  value={analysisForm.primaryWinReason}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, primaryWinReason: event.target.value }))}
                >
                  <option value="">Select reason</option>
                  {winReasonOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Referral type
                <select
                  value={analysisForm.referralType}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, referralType: event.target.value }))}
                >
                  <option value="">Select referral type</option>
                  {referralTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Referral name
                <input
                  value={analysisForm.referralName}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, referralName: event.target.value }))}
                  placeholder="Optional"
                />
              </label>
              <label>
                Winner
                <select
                  value={analysisForm.winner}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, winner: event.target.value }))}
                >
                  <option value="us">Us</option>
                  <option value="ADP">ADP</option>
                  <option value="Paychex">Paychex</option>
                  <option value="Insperity">Insperity</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="admin-form-span-2">
                Win notes
                <textarea
                  rows={3}
                  value={analysisForm.winNotes}
                  onChange={(event) => setAnalysisForm((current) => ({ ...current, winNotes: event.target.value }))}
                  placeholder="Optional notes about the outcome"
                />
              </label>
            </div>

            <div className="admin-section-grid">
              <div>
                <p className="eyebrow">Competitors Involved</p>
                <div className="chip-grid">
                  {competitorOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={analysisForm.competitorsInvolved.includes(option) ? "chip chip-active" : "chip"}
                      onClick={() =>
                        setAnalysisForm((current) => ({
                          ...current,
                          competitorsInvolved: toggleSelection(current.competitorsInvolved, option)
                        }))
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow">Top Objections</p>
                <div className="chip-grid">
                  {objectionOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={analysisForm.topObjections.includes(option) ? "chip chip-active" : "chip"}
                      onClick={() =>
                        setAnalysisForm((current) => ({
                          ...current,
                          topObjections: toggleSelection(current.topObjections, option)
                        }))
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="button" onClick={() => void handleAnalysisSave()} disabled={savingAnalysis}>
                {savingAnalysis ? "Saving..." : "Save Analysis"}
              </button>
              <button type="button" className="ghost-button" onClick={resetAnalysis}>
                Skip for now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
