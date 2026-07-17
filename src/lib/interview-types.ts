import { z } from "zod";

export const InterviewTypeSchema = z.enum(["mixed", "behavioral", "technical", "practical"]);
export type InterviewType = z.infer<typeof InterviewTypeSchema>;

export const INTERVIEW_TYPES: { value: InterviewType; label: string; description: string }[] = [
  { value: "mixed", label: "Full Interview", description: "8 verbal questions (background, behavioral, technical) plus 2 practical tasks — adapts to your answers." },
  { value: "behavioral", label: "Behavioral focus", description: "Same 8+2 structure with heavier weighting on situational and past-experience prompts." },
  { value: "technical", label: "Technical focus", description: "Same 8+2 structure with deeper technical questioning and harder practical tasks." },
  { value: "practical", label: "Practical focus", description: "Same 8+2 structure — practical tasks form the centerpiece of evaluation." },
];

export const SenioritySchema = z.enum(["intern", "junior", "mid", "senior", "staff", "lead"]);
export type Seniority = z.infer<typeof SenioritySchema>;

export const SENIORITY_LEVELS: { value: Seniority; label: string; description: string }[] = [
  { value: "intern", label: "Intern", description: "Fundamentals, learning mindset, curiosity." },
  { value: "junior", label: "Junior (0–2 yrs)", description: "Core skills, simple problem-solving." },
  { value: "mid", label: "Mid-level (2–5 yrs)", description: "Ownership, trade-offs, cross-team work." },
  { value: "senior", label: "Senior (5–8 yrs)", description: "Architecture, mentoring, ambiguity." },
  { value: "staff", label: "Staff / Principal", description: "Org-wide technical leadership." },
  { value: "lead", label: "Team Lead / Manager", description: "People leadership and delivery." },
];

export type InterviewLanguage = typeof INTERVIEW_LANGUAGES[number]["value"];

export const INTERVIEW_LANGUAGES = [
  { value: "en", label: "English", nativeLabel: "English" },
  { value: "es", label: "Spanish", nativeLabel: "Español" },
  { value: "fr", label: "French", nativeLabel: "Français" },
  { value: "de", label: "German", nativeLabel: "Deutsch" },
  { value: "pt", label: "Portuguese", nativeLabel: "Português" },
  { value: "zh", label: "Chinese (Mandarin)", nativeLabel: "中文" },
  { value: "ja", label: "Japanese", nativeLabel: "日本語" },
  { value: "ko", label: "Korean", nativeLabel: "한국어" },
  { value: "ar", label: "Arabic", nativeLabel: "العربية" },
  { value: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { value: "zu", label: "Zulu", nativeLabel: "isiZulu" },
  { value: "af", label: "Afrikaans", nativeLabel: "Afrikaans" },
  { value: "sw", label: "Swahili", nativeLabel: "Kiswahili" },
  { value: "it", label: "Italian", nativeLabel: "Italiano" },
  { value: "nl", label: "Dutch", nativeLabel: "Nederlands" },
  { value: "ru", label: "Russian", nativeLabel: "Русский" },
  { value: "tr", label: "Turkish", nativeLabel: "Türkçe" },
  { value: "pl", label: "Polish", nativeLabel: "Polski" },
] as const;

