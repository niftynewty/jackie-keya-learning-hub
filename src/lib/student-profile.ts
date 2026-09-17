import type { Tables } from "@/integrations/supabase/types";

export type StudentProfile = Tables<"profiles">;

export const LIFE_STAGES = [
  "Healing after heartbreak",
  "Separating or divorcing",
  "Co-parenting",
  "Step-parenting",
  "Newly blended family",
  "Rebuilding after loss",
  "Preparing for marriage",
  "Personal growth season",
] as const;

export const FOCUS_AREAS = [
  "Healing & heartbreak",
  "Relationships",
  "Blended families",
  "Parenting & co-parenting",
  "Boundaries",
  "Communication",
  "Confidence",
  "Personal growth",
  "New beginnings",
  "Faith & inner peace",
] as const;

export const RELATIONSHIP_STATUS = ["Single", "Dating", "Engaged", "Married", "Separated", "Divorced", "Widowed", "Prefer not to say"] as const;
export const FAMILY_SITUATIONS = ["No children", "Biological parent", "Step-parent", "Blended household", "Co-parenting apart", "Guardian or caregiver"] as const;
export const GENDERS = ["Woman", "Man", "Non-binary", "Prefer not to say"] as const;
export const REFERRAL_SOURCES = ["Instagram", "Facebook", "WhatsApp", "Friend or family", "Radio or TV", "Google search", "Church or group", "Other"] as const;
export const LANGUAGES = ["English", "Swahili", "English & Swahili"] as const;
export const CONTACT_METHODS = [
  ["email", "Email"],
  ["whatsapp", "WhatsApp"],
  ["phone", "Phone call"],
  ["sms", "SMS"],
] as const;
export const REMINDER_TIMES = [
  ["morning", "Morning (7–9am)"],
  ["midday", "Midday (12–2pm)"],
  ["evening", "Evening (7–9pm)"],
  ["none", "No reminders"],
] as const;
export const TIMEZONES = ["Africa/Nairobi", "Africa/Kampala", "Africa/Lagos", "Africa/Johannesburg", "Europe/London", "America/New_York", "Asia/Dubai"] as const;
export const VISIBILITY = [
  ["private", "Private — only Jackie's team"],
  ["community", "Community — share first name with fellow students"],
] as const;

/** Fields that count toward a completeness score, grouped for the checklist UI. */
export const COMPLETENESS_FIELDS: Array<{ key: keyof StudentProfile; label: string }> = [
  { key: "display_name", label: "Your name" },
  { key: "avatar_url", label: "Profile photo" },
  { key: "headline", label: "A short headline" },
  { key: "bio", label: "About you" },
  { key: "phone", label: "Phone number" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "date_of_birth", label: "Date of birth" },
  { key: "life_stage", label: "Current season" },
  { key: "focus_areas", label: "Focus areas" },
  { key: "goals", label: "What you want from this journey" },
  { key: "relationship_status", label: "Relationship status" },
  { key: "family_situation", label: "Family situation" },
  { key: "referral_source", label: "How you found us" },
];

const filled = (value: unknown) => Array.isArray(value) ? value.length > 0 : typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;

export function completeness(profile: StudentProfile) {
  const missing = COMPLETENESS_FIELDS.filter((field) => !filled(profile[field.key]));
  const percent = Math.round(((COMPLETENESS_FIELDS.length - missing.length) / COMPLETENESS_FIELDS.length) * 100);
  return { percent, missing, total: COMPLETENESS_FIELDS.length, done: COMPLETENESS_FIELDS.length - missing.length };
}

/** Engagement tier from real learning activity — used for the warm status badge. */
export function engagementTier(lessons: number, minutes: number, courses: number) {
  const score = lessons * 3 + Math.round(minutes / 10) + courses * 5;
  if (score >= 60) return { label: "Devoted learner", copy: "You show up consistently. That steadiness is doing quiet work.", tone: "bg-primary text-primary-foreground" };
  if (score >= 30) return { label: "Steady rhythm", copy: "You are building a real habit of gentle progress.", tone: "bg-accent text-accent-foreground" };
  if (score >= 8) return { label: "Finding your pace", copy: "You have begun, and beginning is the hardest part.", tone: "bg-secondary text-secondary-foreground" };
  return { label: "New here", copy: "Welcome. Take the first lesson whenever you feel ready.", tone: "bg-muted text-foreground" };
}

export function recency(lastActive: string | null) {
  if (!lastActive) return { label: "No recent activity", days: null as number | null };
  const days = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86_400_000);
  if (days <= 0) return { label: "Active today", days };
  if (days === 1) return { label: "Active yesterday", days };
  if (days < 7) return { label: `Active ${days} days ago`, days };
  if (days < 30) return { label: `Active ${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`, days };
  return { label: `Away for ${Math.floor(days / 30)} month${days < 60 ? "" : "s"}`, days };
}

export const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }) : "—";
