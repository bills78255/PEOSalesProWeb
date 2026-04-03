import { notFound } from "next/navigation";

import { OpportunityAdminForm } from "@/components/opportunities/opportunity-admin-form";
import type { MarketplaceOpportunity } from "@/lib/marketplace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditOpportunityListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditOpportunityListingPage({ params }: EditOpportunityListingPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from("marketplace_opportunities").select("*").eq("id", id).single();

  if (error || !data) {
    notFound();
  }

  return <OpportunityAdminForm mode="edit" opportunity={data as MarketplaceOpportunity} />;
}
