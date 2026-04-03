export type MarketplaceListingType =
  | "job"
  | "franchise"
  | "partner"
  | "sponsored";

export type MarketplaceRemoteType = "remote" | "hybrid" | "onsite";

export type MarketplaceEmploymentType =
  | "full_time"
  | "contract"
  | "independent"
  | "franchise";

export type MarketplaceStatus = "draft" | "published" | "expired" | "archived";

export type MarketplaceOpportunity = {
  id: string;
  title: string;
  company_name: string;
  short_description: string;
  listing_type: MarketplaceListingType;
  category: string;
  description: string;
  location: string;
  remote_type: MarketplaceRemoteType;
  employment_type: MarketplaceEmploymentType;
  compensation_type: string;
  compensation_min: number | null;
  compensation_max: number | null;
  residual_available: boolean;
  franchise_available: boolean;
  contact_email: string;
  apply_url: string;
  is_featured: boolean;
  is_sponsored: boolean;
  status: MarketplaceStatus;
  posted_by: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export const listingTypeOptions: Array<{ value: MarketplaceListingType; label: string }> = [
  { value: "job", label: "Jobs" },
  { value: "franchise", label: "Franchise Opportunities" },
  { value: "partner", label: "Partner Programs" },
  { value: "sponsored", label: "Sponsored Listings" }
];

export const categoryOptions = [
  { value: "peo_sales", label: "PEO Sales" },
  { value: "broker", label: "Broker" },
  { value: "channel_partner", label: "Channel Partner" },
  { value: "franchise", label: "Franchise" },
  { value: "recruiter", label: "Recruiter" }
] as const;

export const remoteTypeOptions: Array<{ value: MarketplaceRemoteType; label: string }> = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" }
];

export const employmentTypeOptions: Array<{ value: MarketplaceEmploymentType; label: string }> = [
  { value: "full_time", label: "Full Time" },
  { value: "contract", label: "Contract" },
  { value: "independent", label: "Independent" },
  { value: "franchise", label: "Franchise" }
];

export const compensationTypeOptions = [
  { value: "salary", label: "Salary" },
  { value: "commission", label: "Commission" },
  { value: "salary_plus_commission", label: "Salary + Commission" },
  { value: "residual", label: "Residual" },
  { value: "franchise", label: "Franchise" }
] as const;

export const statusOptions: Array<{ value: MarketplaceStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "expired", label: "Expired" },
  { value: "archived", label: "Archived" }
];

export function listingTypeLabel(type: MarketplaceListingType) {
  return listingTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function remoteTypeLabel(type: MarketplaceRemoteType) {
  return remoteTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function employmentTypeLabel(type: MarketplaceEmploymentType) {
  return employmentTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function categoryLabel(category: string) {
  return categoryOptions.find((option) => option.value === category)?.label ?? category;
}

export function compensationTypeLabel(type: string) {
  return compensationTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function formatCompensationRange(min: number | null, max: number | null) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
  if (min) return `From ${formatter.format(min)}`;
  if (max) return `Up to ${formatter.format(max)}`;
  return null;
}

export function isMarketplaceOpportunityActive(
  opportunity: Pick<MarketplaceOpportunity, "status" | "starts_at" | "expires_at">,
  now = new Date()
) {
  if (opportunity.status !== "published") return false;

  const startsAt = opportunity.starts_at ? new Date(opportunity.starts_at) : null;
  const expiresAt = opportunity.expires_at ? new Date(opportunity.expires_at) : null;

  if (startsAt && startsAt > now) return false;
  if (expiresAt && expiresAt <= now) return false;

  return true;
}
