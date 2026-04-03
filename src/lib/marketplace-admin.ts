import { z } from "zod";

import type {
  MarketplaceEmploymentType,
  MarketplaceListingType,
  MarketplaceOpportunity,
  MarketplaceRemoteType,
  MarketplaceStatus
} from "@/lib/marketplace";

export const marketplaceAdminSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    company_name: z.string().trim().min(1, "Company name is required."),
    short_description: z.string().trim().optional(),
    description: z.string().trim().optional(),
    listing_type: z.enum(["job", "franchise", "partner", "sponsored"]),
    category: z.enum(["peo_sales", "broker", "channel_partner", "franchise", "recruiter"]),
    location: z.string().trim().optional(),
    remote_type: z.enum(["remote", "hybrid", "onsite"]),
    employment_type: z.enum(["full_time", "contract", "independent", "franchise"]),
    compensation_type: z.enum(["salary", "commission", "salary_plus_commission", "residual", "franchise"]).optional(),
    compensation_min: z.string().optional(),
    compensation_max: z.string().optional(),
    residual_available: z.boolean(),
    franchise_available: z.boolean(),
    contact_email: z.string().trim().optional(),
    apply_url: z.string().trim().optional(),
    is_featured: z.boolean(),
    is_sponsored: z.boolean(),
    status: z.enum(["draft", "published", "expired", "archived"]),
    starts_at: z.string().optional(),
    expires_at: z.string().optional()
  })
  .superRefine((value, ctx) => {
    const compensationMin = value.compensation_min ? Number(value.compensation_min) : null;
    const compensationMax = value.compensation_max ? Number(value.compensation_max) : null;
    const startsAt = value.starts_at ? new Date(value.starts_at) : null;
    const expiresAt = value.expires_at ? new Date(value.expires_at) : null;
    const hasApplyContact = Boolean(value.contact_email?.trim() || value.apply_url?.trim());

    if (value.status === "published" && !hasApplyContact) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Published listings require either a contact email or an apply URL.",
        path: ["contact_email"]
      });
    }

    if (compensationMin !== null && Number.isNaN(compensationMin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Compensation minimum must be a valid number.",
        path: ["compensation_min"]
      });
    }

    if (compensationMax !== null && Number.isNaN(compensationMax)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Compensation maximum must be a valid number.",
        path: ["compensation_max"]
      });
    }

    if (
      compensationMin !== null &&
      compensationMax !== null &&
      !Number.isNaN(compensationMin) &&
      !Number.isNaN(compensationMax) &&
      compensationMax < compensationMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Compensation max must be greater than or equal to compensation min.",
        path: ["compensation_max"]
      });
    }

    if (value.contact_email?.trim()) {
      const emailCheck = z.string().email().safeParse(value.contact_email.trim());
      if (!emailCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Contact email must be valid.",
          path: ["contact_email"]
        });
      }
    }

    if (value.apply_url?.trim()) {
      const urlCheck = z.string().url().safeParse(value.apply_url.trim());
      if (!urlCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Apply URL must be valid.",
          path: ["apply_url"]
        });
      }
    }

    if (startsAt && Number.isNaN(startsAt.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be valid.",
        path: ["starts_at"]
      });
    }

    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiration date must be valid.",
        path: ["expires_at"]
      });
    }

    if (
      startsAt &&
      expiresAt &&
      !Number.isNaN(startsAt.getTime()) &&
      !Number.isNaN(expiresAt.getTime()) &&
      expiresAt <= startsAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiration must be after the start date.",
        path: ["expires_at"]
      });
    }
  });

export type MarketplaceAdminFormValues = z.infer<typeof marketplaceAdminSchema>;

export type MarketplaceAdminDraft = {
  title: string;
  companyName: string;
  shortDescription: string;
  description: string;
  listingType: MarketplaceListingType;
  category: "peo_sales" | "broker" | "channel_partner" | "franchise" | "recruiter";
  location: string;
  remoteType: MarketplaceRemoteType;
  employmentType: MarketplaceEmploymentType;
  compensationType: "salary" | "commission" | "salary_plus_commission" | "residual" | "franchise";
  compensationMin: string;
  compensationMax: string;
  residualAvailable: boolean;
  franchiseAvailable: boolean;
  contactEmail: string;
  applyUrl: string;
  isFeatured: boolean;
  isSponsored: boolean;
  status: MarketplaceStatus;
  startsAt: string;
  expiresAt: string;
};

export const initialMarketplaceAdminDraft: MarketplaceAdminDraft = {
  title: "",
  companyName: "",
  shortDescription: "",
  description: "",
  listingType: "job",
  category: "peo_sales",
  location: "",
  remoteType: "remote",
  employmentType: "full_time",
  compensationType: "salary",
  compensationMin: "",
  compensationMax: "",
  residualAvailable: false,
  franchiseAvailable: false,
  contactEmail: "",
  applyUrl: "",
  isFeatured: false,
  isSponsored: false,
  status: "draft",
  startsAt: "",
  expiresAt: ""
};

export function draftFromMarketplaceOpportunity(opportunity: MarketplaceOpportunity): MarketplaceAdminDraft {
  return {
    title: opportunity.title,
    companyName: opportunity.company_name,
    shortDescription: opportunity.short_description,
    description: opportunity.description,
    listingType: opportunity.listing_type,
    category: opportunity.category as MarketplaceAdminDraft["category"],
    location: opportunity.location,
    remoteType: opportunity.remote_type,
    employmentType: opportunity.employment_type,
    compensationType:
      (opportunity.compensation_type as MarketplaceAdminDraft["compensationType"]) || "salary",
    compensationMin: opportunity.compensation_min?.toString() ?? "",
    compensationMax: opportunity.compensation_max?.toString() ?? "",
    residualAvailable: opportunity.residual_available,
    franchiseAvailable: opportunity.franchise_available,
    contactEmail: opportunity.contact_email,
    applyUrl: opportunity.apply_url,
    isFeatured: opportunity.is_featured,
    isSponsored: opportunity.is_sponsored,
    status: opportunity.status,
    startsAt: formatDateTimeLocal(opportunity.starts_at),
    expiresAt: formatDateTimeLocal(opportunity.expires_at)
  };
}

export function normalizeMarketplaceDraft(
  draft: MarketplaceAdminDraft,
  overrideStatus?: MarketplaceStatus,
  postedBy?: string | null
) {
  const parsed = marketplaceAdminSchema.safeParse({
    title: draft.title,
    company_name: draft.companyName,
    short_description: draft.shortDescription,
    description: draft.description,
    listing_type: draft.listingType,
    category: draft.category,
    location: draft.location,
    remote_type: draft.remoteType,
    employment_type: draft.employmentType,
    compensation_type: draft.compensationType,
    compensation_min: draft.compensationMin,
    compensation_max: draft.compensationMax,
    residual_available: draft.residualAvailable,
    franchise_available: draft.franchiseAvailable,
    contact_email: draft.contactEmail,
    apply_url: draft.applyUrl,
    is_featured: draft.isFeatured,
    is_sponsored: draft.isSponsored,
    status: overrideStatus ?? draft.status,
    starts_at: draft.startsAt,
    expires_at: draft.expiresAt
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const value = parsed.data;

  return {
    success: true as const,
    payload: {
      title: value.title,
      company_name: value.company_name,
      short_description: value.short_description?.trim() || "",
      description: value.description?.trim() || "",
      listing_type: value.listing_type,
      category: value.category,
      location: value.location?.trim() || "",
      remote_type: value.remote_type,
      employment_type: value.employment_type,
      compensation_type: value.compensation_type?.trim() || "",
      compensation_min: value.compensation_min ? Number(value.compensation_min) : null,
      compensation_max: value.compensation_max ? Number(value.compensation_max) : null,
      residual_available: value.residual_available,
      franchise_available: value.franchise_available,
      contact_email: value.contact_email?.trim() || "",
      apply_url: value.apply_url?.trim() || "",
      is_featured: value.is_featured,
      is_sponsored: value.is_sponsored,
      status: value.status,
      posted_by: postedBy ?? null,
      starts_at: value.starts_at || null,
      expires_at: value.expires_at || null
    }
  };
}

function formatDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  const hh = `${date.getHours()}`.padStart(2, "0");
  const min = `${date.getMinutes()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
