export type ContentStatus = "draft" | "published" | "archived";

export type TrainingCategory =
  | "peo_basics"
  | "pricing"
  | "workers_comp"
  | "benefits"
  | "prospecting"
  | "discovery"
  | "objections"
  | "closing";

export type ScriptCategory =
  | "phone"
  | "email"
  | "referral_partner"
  | "discovery"
  | "objection_handling"
  | "closing";

export type ScriptType =
  | "cold_outreach"
  | "call_script"
  | "email_template"
  | "follow_up"
  | "objection_response"
  | "playbook";

export type ArticleCategory =
  | "sales_strategy"
  | "industry"
  | "leadership"
  | "compensation"
  | "operations";

export type TrainingRecord = {
  id: string;
  title: string;
  summary: string;
  category: TrainingCategory;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TrainingLessonRecord = {
  id: string;
  training_id: string;
  title: string;
  body: string;
  action_step: string;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type QuizRecord = {
  id: string;
  lesson_id: string;
  title: string;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type QuizQuestionRecord = {
  id: string;
  quiz_id: string;
  prompt: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type QuizAnswerRecord = {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ScriptRecord = {
  id: string;
  title: string;
  category: ScriptCategory;
  script_type: ScriptType;
  body: string;
  tags: string[];
  is_featured: boolean;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ArticleRecord = {
  id: string;
  title: string;
  preview: string;
  body: string;
  category: ArticleCategory;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const contentStatusOptions: Array<{ value: ContentStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" }
];

export const trainingCategoryOptions: Array<{ value: TrainingCategory; label: string }> = [
  { value: "peo_basics", label: "PEO Basics" },
  { value: "pricing", label: "Pricing" },
  { value: "workers_comp", label: "Workers' Comp" },
  { value: "benefits", label: "Benefits" },
  { value: "prospecting", label: "Prospecting" },
  { value: "discovery", label: "Discovery" },
  { value: "objections", label: "Objections" },
  { value: "closing", label: "Closing" }
];

export const scriptCategoryOptions: Array<{ value: ScriptCategory; label: string }> = [
  { value: "phone", label: "Phone Prospecting" },
  { value: "email", label: "Email Prospecting" },
  { value: "referral_partner", label: "Referral Partners" },
  { value: "discovery", label: "Discovery" },
  { value: "objection_handling", label: "Objection Handling" },
  { value: "closing", label: "Closing" }
];

export const scriptTypeOptions: Array<{ value: ScriptType; label: string }> = [
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "call_script", label: "Call Script" },
  { value: "email_template", label: "Email Template" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "objection_response", label: "Objection Response" },
  { value: "playbook", label: "Playbook" }
];

export const articleCategoryOptions: Array<{ value: ArticleCategory; label: string }> = [
  { value: "sales_strategy", label: "Sales Strategy" },
  { value: "industry", label: "Industry" },
  { value: "leadership", label: "Leadership" },
  { value: "compensation", label: "Compensation" },
  { value: "operations", label: "Operations" }
];

export function optionLabel<T extends string>(options: Array<{ value: T; label: string }>, value: T | string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function contentStatusLabel(status: ContentStatus) {
  return optionLabel(contentStatusOptions, status);
}

export function trainingCategoryLabel(category: TrainingCategory | string) {
  return optionLabel(trainingCategoryOptions, category);
}

export function scriptCategoryLabel(category: ScriptCategory | string) {
  return optionLabel(scriptCategoryOptions, category);
}

export function scriptTypeLabel(type: ScriptType | string) {
  return optionLabel(scriptTypeOptions, type);
}

export function articleCategoryLabel(category: ArticleCategory | string) {
  return optionLabel(articleCategoryOptions, category);
}

export function parseTags(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function tagsToString(tags: string[] | null | undefined) {
  return (tags ?? []).join(", ");
}
