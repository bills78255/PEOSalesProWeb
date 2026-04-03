import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";
import { categoryOptions, listingTypeLabel, listingTypeOptions, statusOptions } from "@/lib/marketplace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminOpportunitiesPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    listing_type?: string;
    category?: string;
  }>;
};

export default async function AdminOpportunitiesPage({ searchParams }: AdminOpportunitiesPageProps) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("marketplace_opportunities")
    .select(
      "id,title,company_name,listing_type,category,status,is_featured,is_sponsored,starts_at,expires_at,updated_at"
    )
    .order("updated_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.listing_type) {
    query = query.eq("listing_type", params.listing_type);
  }

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.q?.trim()) {
    const search = params.q.trim();
    query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%`);
  }

  const { data: listings, error } = await query;

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin"
        title="Manage opportunities marketplace"
        description="Create, search, filter, and maintain paid marketplace listings separately from the rep sales pipeline."
      />

      <Card
        title="Listings"
        eyebrow="Marketplace"
        action={
          <Link href="/admin/opportunities/new" className="button-link">
            New Listing
          </Link>
        }
      >
        <form className="marketplace-filters admin-marketplace-filters" method="get">
          <label>
            Search
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search title or company" />
          </label>
          <label>
            Status
            <select name="status" defaultValue={params.status ?? ""}>
              <option value="">All statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Listing type
            <select name="listing_type" defaultValue={params.listing_type ?? ""}>
              <option value="">All types</option>
              {listingTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category
            <select name="category" defaultValue={params.category ?? ""}>
              <option value="">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="marketplace-filter-actions">
            <button type="submit">Apply</button>
            <Link href="/admin/opportunities" className="ghost-link">
              Reset
            </Link>
          </div>
        </form>

        {error ? (
          <p className="form-message error">{error.message}</p>
        ) : listings?.length ? (
          <div className="admin-opportunity-list">
            {listings.map((listing) => (
              <article key={listing.id} className="admin-opportunity-row">
                <div>
                  <strong>{listing.title}</strong>
                  <p>
                    {listing.company_name} · {listingTypeLabel(listing.listing_type)}
                  </p>
                  <small>
                    {listing.status}
                    {listing.category ? ` · ${listing.category}` : ""}
                    {listing.is_featured ? " · featured" : ""}
                    {listing.is_sponsored ? " · sponsored" : ""}
                  </small>
                  <small>
                    {listing.starts_at ? `Starts ${new Date(listing.starts_at).toLocaleString()}` : "No start date"}
                    {listing.expires_at ? ` · Expires ${new Date(listing.expires_at).toLocaleString()}` : ""}
                  </small>
                </div>
                <div className="admin-opportunity-actions">
                  <Link href={`/admin/opportunities/${listing.id}/edit`} className="secondary-button">
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="helper-text">No marketplace listings match the current filters.</p>
        )}
      </Card>
    </div>
  );
}
