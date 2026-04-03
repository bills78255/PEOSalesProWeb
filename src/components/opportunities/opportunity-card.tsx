import Link from "next/link";

import {
  categoryLabel,
  employmentTypeLabel,
  formatCompensationRange,
  listingTypeLabel,
  remoteTypeLabel,
  type MarketplaceOpportunity
} from "@/lib/marketplace";

type OpportunityCardProps = {
  opportunity: MarketplaceOpportunity;
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const compensation = formatCompensationRange(opportunity.compensation_min, opportunity.compensation_max);
  const summary = opportunity.short_description || opportunity.description;

  return (
    <article className="marketplace-card">
      <div className="marketplace-card-top">
        <div>
          <p className="eyebrow">{listingTypeLabel(opportunity.listing_type)}</p>
          <h3>{opportunity.title}</h3>
          <p className="marketplace-company">{opportunity.company_name || "PEO Sales Pro Network"}</p>
        </div>
        <div className="marketplace-badges">
          {opportunity.is_featured ? <span className="marketplace-badge featured">Featured</span> : null}
          {opportunity.is_sponsored ? <span className="marketplace-badge sponsored">Sponsored</span> : null}
        </div>
      </div>

      <p className="marketplace-description">{summary}</p>

      <div className="marketplace-meta">
        {opportunity.category ? <span>{categoryLabel(opportunity.category)}</span> : null}
        <span>{remoteTypeLabel(opportunity.remote_type)}</span>
        <span>{employmentTypeLabel(opportunity.employment_type)}</span>
        {opportunity.location ? <span>{opportunity.location}</span> : null}
        {opportunity.residual_available ? <span>Residual Available</span> : null}
        {opportunity.franchise_available ? <span>Franchise Available</span> : null}
        {compensation ? <span>{compensation}</span> : null}
      </div>

      <div className="marketplace-card-actions">
        <Link href={`/opportunities/${opportunity.id}`} className="button-link">
          View Details
        </Link>
        {opportunity.apply_url ? (
          <a href={opportunity.apply_url} target="_blank" rel="noreferrer" className="ghost-link">
            Apply
          </a>
        ) : null}
      </div>
    </article>
  );
}
