import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/public/site-header";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  categoryLabel,
  compensationTypeLabel,
  employmentTypeLabel,
  formatCompensationRange,
  isMarketplaceOpportunityActive,
  listingTypeLabel,
  remoteTypeLabel,
  type MarketplaceOpportunity
} from "@/lib/marketplace";

type OpportunityDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("marketplace_opportunities")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !data) {
    notFound();
  }

  const opportunity = data as MarketplaceOpportunity;
  if (!isMarketplaceOpportunityActive(opportunity)) {
    notFound();
  }

  const compensation = formatCompensationRange(opportunity.compensation_min, opportunity.compensation_max);
  const detailItems = [
    opportunity.category ? `Category: ${categoryLabel(opportunity.category)}` : null,
    `Opportunity type: ${listingTypeLabel(opportunity.listing_type)}`,
    `Work style: ${remoteTypeLabel(opportunity.remote_type)}`,
    `Employment type: ${employmentTypeLabel(opportunity.employment_type)}`,
    opportunity.location ? `Location: ${opportunity.location}` : null,
    opportunity.compensation_type ? `Compensation: ${compensationTypeLabel(opportunity.compensation_type)}` : null,
    compensation ? `Compensation range: ${compensation}` : null,
    opportunity.residual_available ? "Residual income available" : null,
    opportunity.franchise_available ? "Franchise path available" : null
  ].filter(Boolean) as string[];

  return (
    <main className="marketing-shell">
      <SiteHeader />
      <section className="page-stack marketplace-shell">
        <Link href="/opportunities" className="ghost-link marketplace-back-link">
          Back to Opportunities
        </Link>

        <Card className="marketplace-detail-hero">
          <p className="eyebrow">{listingTypeLabel(opportunity.listing_type)}</p>
          <h3>{opportunity.title}</h3>
          <p className="marketplace-company">{opportunity.company_name || "PEO Sales Pro Network"}</p>
          {opportunity.short_description ? (
            <p className="marketplace-description">{opportunity.short_description}</p>
          ) : null}
          <div className="marketplace-meta">
            {opportunity.category ? <span>{categoryLabel(opportunity.category)}</span> : null}
            <span>{remoteTypeLabel(opportunity.remote_type)}</span>
            <span>{employmentTypeLabel(opportunity.employment_type)}</span>
            {opportunity.location ? <span>{opportunity.location}</span> : null}
            {compensation ? <span>{compensation}</span> : null}
            {opportunity.residual_available ? <span>Residual Available</span> : null}
            {opportunity.franchise_available ? <span>Franchise Available</span> : null}
          </div>
        </Card>

        <div className="content-grid marketplace-detail-grid">
          <Card title="Overview" eyebrow="Listing">
            <p className="marketplace-detail-copy">
              {opportunity.short_description || "This opportunity is part of the PEO Sales Pro marketplace."}
            </p>
          </Card>

          <Card title="Apply / Contact" eyebrow="Next Step">
            <ul className="stack-list">
              {opportunity.apply_url ? <li>Apply directly through the posted link.</li> : null}
              {!opportunity.apply_url && opportunity.contact_email ? (
                <li>Reach out directly to the listing contact for next steps.</li>
              ) : null}
              {opportunity.contact_email ? <li>Contact: {opportunity.contact_email}</li> : null}
              {opportunity.starts_at ? <li>Starts: {new Date(opportunity.starts_at).toLocaleString()}</li> : null}
              {opportunity.expires_at ? <li>Expires: {new Date(opportunity.expires_at).toLocaleString()}</li> : null}
            </ul>
            {opportunity.apply_url ? (
              <a href={opportunity.apply_url} target="_blank" rel="noreferrer" className="button-link">
                View Application
              </a>
            ) : opportunity.contact_email ? (
              <a href={`mailto:${opportunity.contact_email}`} className="button-link">
                Contact Listing Owner
              </a>
            ) : (
              <p>No direct apply method has been posted yet.</p>
            )}
          </Card>
        </div>

        <div className="content-grid marketplace-detail-grid">
          <Card title="Full Description" eyebrow="Role Details">
            <p className="marketplace-detail-copy">{opportunity.description}</p>
          </Card>

          <Card title="Opportunity Details" eyebrow="Snapshot">
            <ul className="stack-list">
              {detailItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </main>
  );
}
