import { SiteHeader } from "@/components/public/site-header";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OpportunityFilters } from "@/components/opportunities/opportunity-filters";
import { Card } from "@/components/ui/card";
import {
  categoryLabel,
  isMarketplaceOpportunityActive,
  type MarketplaceOpportunity
} from "@/lib/marketplace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OpportunitiesPageProps = {
  searchParams?: Promise<{
    listing_type?: string;
    category?: string;
    remote_type?: string;
    featured?: string;
    q?: string;
  }>;
};

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marketplace_opportunities")
    .select("*")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const allPublishedListings = ((data ?? []) as MarketplaceOpportunity[]).filter((opportunity) =>
    isMarketplaceOpportunityActive(opportunity)
  );
  const searchValue = params.q?.trim().toLowerCase() ?? "";
  const featuredOnly = params.featured === "true";

  const listings = allPublishedListings.filter((opportunity) => {
    if (params.listing_type && opportunity.listing_type !== params.listing_type) return false;
    if (params.category && opportunity.category !== params.category) return false;
    if (params.remote_type && opportunity.remote_type !== params.remote_type) return false;
    if (featuredOnly && !opportunity.is_featured) return false;

    if (searchValue) {
      const title = opportunity.title.toLowerCase();
      const company = opportunity.company_name.toLowerCase();
      if (!title.includes(searchValue) && !company.includes(searchValue)) return false;
    }

    return true;
  });

  const categories = Array.from(
    new Set(allPublishedListings.map((row) => row.category).filter(Boolean))
  ).sort((left, right) => categoryLabel(left).localeCompare(categoryLabel(right)));

  return (
    <main className="marketing-shell">
      <SiteHeader />
      <section className="page-stack marketplace-shell">
        <header className="marketplace-hero card">
          <p className="eyebrow">Opportunities Marketplace</p>
          <h1>Explore PEO jobs, franchise paths, partner programs, and sponsored listings.</h1>
          <p className="hero-copy">
            A curated public board for PEO sales professionals, operators, brokers, and growth-minded partners looking
            for their next move in the industry.
          </p>
        </header>

        <Card title="Find the right opportunity" eyebrow="Browse">
          <OpportunityFilters
            selectedListingType={params.listing_type}
            selectedCategory={params.category}
            selectedRemoteType={params.remote_type}
            featuredOnly={featuredOnly}
            searchQuery={params.q}
            categories={categories}
          />
        </Card>

        {error ? (
          <Card title="Unable to load listings" eyebrow="Marketplace">
            <p>{error.message}</p>
          </Card>
        ) : listings?.length ? (
          <section className="marketplace-grid">
            {listings.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </section>
        ) : (
          <Card title="No listings match your filters" eyebrow="Marketplace">
            <p>
              Try widening your filters, clearing the search, or check back soon as new marketplace opportunities are
              added.
            </p>
          </Card>
        )}
      </section>
    </main>
  );
}
