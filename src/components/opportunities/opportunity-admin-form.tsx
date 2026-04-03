"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  categoryOptions,
  compensationTypeOptions,
  employmentTypeOptions,
  listingTypeOptions,
  remoteTypeOptions,
  statusOptions,
  type MarketplaceOpportunity,
  type MarketplaceStatus
} from "@/lib/marketplace";
import {
  draftFromMarketplaceOpportunity,
  initialMarketplaceAdminDraft,
  normalizeMarketplaceDraft,
  type MarketplaceAdminDraft
} from "@/lib/marketplace-admin";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type OpportunityAdminFormProps = {
  mode: "create" | "edit";
  opportunity?: MarketplaceOpportunity;
};

export function OpportunityAdminForm({ mode, opportunity }: OpportunityAdminFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [draft, setDraft] = useState<MarketplaceAdminDraft>(
    opportunity ? draftFromMarketplaceOpportunity(opportunity) : initialMarketplaceAdminDraft
  );
  const [savingAction, setSavingAction] = useState<"draft" | "publish" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  const pageTitle = mode === "create" ? "Create opportunity listing" : "Edit opportunity listing";
  const pageDescription =
    mode === "create"
      ? "Create a new paid marketplace listing for the PEO industry."
      : "Update an existing marketplace listing, adjust promotion settings, or publish it.";

  const actionLabel = useMemo(
    () => (savingAction === "publish" ? "Publishing..." : savingAction === "draft" ? "Saving draft..." : null),
    [savingAction]
  );

  function setValue<Key extends keyof MarketplaceAdminDraft>(key: Key, value: MarketplaceAdminDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submitWithStatus(targetStatus: MarketplaceStatus) {
    setSavingAction(targetStatus === "published" ? "publish" : "draft");
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSavingAction(null);
      setError(userError?.message ?? "You must be logged in as an admin to manage listings.");
      return;
    }

    const normalized = normalizeMarketplaceDraft(draft, targetStatus, user.id);

    if (!normalized.success) {
      setSavingAction(null);
      setFieldErrors(normalized.errors);
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    const payload = normalized.payload;

    const query =
      mode === "edit" && opportunity
        ? supabase.from("marketplace_opportunities").update(payload).eq("id", opportunity.id).select("id").single()
        : supabase.from("marketplace_opportunities").insert(payload).select("id").single();

    const { data, error: saveError } = await query;
    setSavingAction(null);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setDraft((current) => ({ ...current, status: targetStatus }));
    setSuccess(targetStatus === "published" ? "Listing published successfully." : "Draft saved successfully.");

    const listingID = mode === "edit" ? opportunity?.id : data?.id;
    if (listingID) {
      router.push(`/admin/opportunities/${listingID}/edit`);
      router.refresh();
    } else {
      router.push("/admin/opportunities");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!opportunity) return;
    const confirmed = window.confirm("Delete this marketplace listing?");
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    const { error: deleteError } = await supabase.from("marketplace_opportunities").delete().eq("id", opportunity.id);

    setDeleting(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.push("/admin/opportunities");
    router.refresh();
  }

  return (
    <div className="page-stack">
      <header className="page-intro">
        <p className="eyebrow">Admin</p>
        <h1>{pageTitle}</h1>
        <p>{pageDescription}</p>
      </header>

      <section className="card">
        <div className="card-head">
          <div>
            <p className="eyebrow">{mode === "create" ? "New Listing" : "Listing Details"}</p>
            <h3>{mode === "create" ? "Marketplace listing setup" : opportunity?.title ?? "Edit listing"}</h3>
          </div>
        </div>

        <div className="page-stack">
          <section className="admin-section-grid">
            <div>
              <p className="eyebrow">Basic Info</p>
              <div className="admin-form-grid">
                <label>
                  Title
                  <input value={draft.title} onChange={(event) => setValue("title", event.target.value)} required />
                  {fieldErrors.title ? <span className="field-error">{fieldErrors.title[0]}</span> : null}
                </label>
                <label>
                  Company name
                  <input
                    value={draft.companyName}
                    onChange={(event) => setValue("companyName", event.target.value)}
                    required
                  />
                  {fieldErrors.company_name ? (
                    <span className="field-error">{fieldErrors.company_name[0]}</span>
                  ) : null}
                </label>
                <label className="admin-form-span">
                  Short description
                  <input
                    value={draft.shortDescription}
                    onChange={(event) => setValue("shortDescription", event.target.value)}
                    placeholder="Short teaser for list view"
                  />
                </label>
                <label className="admin-form-span">
                  Description
                  <textarea
                    rows={6}
                    value={draft.description}
                    onChange={(event) => setValue("description", event.target.value)}
                    placeholder="Full marketplace description"
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="eyebrow">Classification</p>
              <div className="admin-form-grid">
                <label>
                  Listing type
                  <select
                    value={draft.listingType}
                    onChange={(event) => setValue("listingType", event.target.value as MarketplaceAdminDraft["listingType"])}
                  >
                    {listingTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Category
                  <select
                    value={draft.category}
                    onChange={(event) => setValue("category", event.target.value as MarketplaceAdminDraft["category"])}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="admin-section-grid">
            <div>
              <p className="eyebrow">Location & Work Style</p>
              <div className="admin-form-grid">
                <label>
                  Location
                  <input value={draft.location} onChange={(event) => setValue("location", event.target.value)} />
                </label>
                <label>
                  Remote type
                  <select
                    value={draft.remoteType}
                    onChange={(event) => setValue("remoteType", event.target.value as MarketplaceAdminDraft["remoteType"])}
                  >
                    {remoteTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Employment type
                  <select
                    value={draft.employmentType}
                    onChange={(event) =>
                      setValue("employmentType", event.target.value as MarketplaceAdminDraft["employmentType"])
                    }
                  >
                    {employmentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div>
              <p className="eyebrow">Compensation</p>
              <div className="admin-form-grid">
                <label>
                  Compensation type
                  <select
                    value={draft.compensationType}
                    onChange={(event) =>
                      setValue("compensationType", event.target.value as MarketplaceAdminDraft["compensationType"])
                    }
                  >
                    {compensationTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Compensation min
                  <input
                    type="number"
                    value={draft.compensationMin}
                    onChange={(event) => setValue("compensationMin", event.target.value)}
                  />
                  {fieldErrors.compensation_min ? (
                    <span className="field-error">{fieldErrors.compensation_min[0]}</span>
                  ) : null}
                </label>
                <label>
                  Compensation max
                  <input
                    type="number"
                    value={draft.compensationMax}
                    onChange={(event) => setValue("compensationMax", event.target.value)}
                  />
                  {fieldErrors.compensation_max ? (
                    <span className="field-error">{fieldErrors.compensation_max[0]}</span>
                  ) : null}
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={draft.residualAvailable}
                    onChange={(event) => setValue("residualAvailable", event.target.checked)}
                  />
                  Residual available
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={draft.franchiseAvailable}
                    onChange={(event) => setValue("franchiseAvailable", event.target.checked)}
                  />
                  Franchise available
                </label>
              </div>
            </div>
          </section>

          <section className="admin-section-grid">
            <div>
              <p className="eyebrow">Contact / Apply</p>
              <div className="admin-form-grid">
                <label>
                  Contact email
                  <input
                    type="email"
                    value={draft.contactEmail}
                    onChange={(event) => setValue("contactEmail", event.target.value)}
                  />
                  {fieldErrors.contact_email ? (
                    <span className="field-error">{fieldErrors.contact_email[0]}</span>
                  ) : null}
                </label>
                <label>
                  Apply URL
                  <input
                    type="url"
                    value={draft.applyUrl}
                    onChange={(event) => setValue("applyUrl", event.target.value)}
                  />
                  {fieldErrors.apply_url ? <span className="field-error">{fieldErrors.apply_url[0]}</span> : null}
                </label>
              </div>
            </div>

            <div>
              <p className="eyebrow">Promotion Controls</p>
              <div className="admin-form-grid">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={draft.isFeatured}
                    onChange={(event) => setValue("isFeatured", event.target.checked)}
                  />
                  Featured listing
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={draft.isSponsored}
                    onChange={(event) => setValue("isSponsored", event.target.checked)}
                  />
                  Sponsored listing
                </label>
                <label>
                  Status
                  <select
                    value={draft.status}
                    onChange={(event) => setValue("status", event.target.value as MarketplaceAdminDraft["status"])}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.status ? <span className="field-error">{fieldErrors.status[0]}</span> : null}
                </label>
              </div>
            </div>
          </section>

          <section className="admin-section-grid">
            <div>
              <p className="eyebrow">Timing</p>
              <div className="admin-form-grid">
                <label>
                  Starts at
                  <input
                    type="datetime-local"
                    value={draft.startsAt}
                    onChange={(event) => setValue("startsAt", event.target.value)}
                  />
                  {fieldErrors.starts_at ? <span className="field-error">{fieldErrors.starts_at[0]}</span> : null}
                </label>
                <label>
                  Expires at
                  <input
                    type="datetime-local"
                    value={draft.expiresAt}
                    onChange={(event) => setValue("expiresAt", event.target.value)}
                  />
                  {fieldErrors.expires_at ? <span className="field-error">{fieldErrors.expires_at[0]}</span> : null}
                </label>
              </div>
            </div>
          </section>

          {error ? <p className="form-message error">{error}</p> : null}
          {success ? <p className="form-message success">{success}</p> : null}

          <div className="admin-form-actions">
            <button type="button" onClick={() => submitWithStatus("draft")} disabled={Boolean(savingAction || deleting)}>
              {savingAction === "draft" ? actionLabel : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => submitWithStatus("published")}
              disabled={Boolean(savingAction || deleting)}
            >
              {savingAction === "publish" ? actionLabel : "Publish"}
            </button>
            {mode === "edit" ? (
              <button type="button" className="secondary-button" onClick={handleDelete} disabled={deleting || Boolean(savingAction)}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
