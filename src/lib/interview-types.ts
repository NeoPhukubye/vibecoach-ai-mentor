import { z } from "zod";

export const InterviewTypeSchema = z.enum(["mixed", "behavioral", "technical", "practical"]);
export type InterviewType = z.infer<typeof InterviewTypeSchema>;

export const INTERVIEW_TYPES: { value: InterviewType; label: string; description: string }[] = [
  { value: "mixed", label: "Mixed", description: "One technical, one behavioral, one culture-fit question." },
  { value: "behavioral", label: "Behavioral", description: "Situational and past-experience questions only." },
  { value: "technical", label: "Technical + Assessment", description: "Two role-specific technical questions plus one hands-on practical assessment — ready for Q&A and live tasks." },
  { value: "practical", label: "Practical only", description: "Hands-on, task-based exercises like a live coding round or take-home challenge." },
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

