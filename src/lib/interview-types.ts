import { z } from "zod";

export const InterviewTypeSchema = z.enum(["mixed", "behavioral", "technical", "practical"]);
export type InterviewType = z.infer<typeof InterviewTypeSchema>;

export const INTERVIEW_TYPES: { value: InterviewType; label: string; description: string }[] = [
  { value: "mixed", label: "Mixed", description: "One technical, one behavioral, one culture-fit question." },
  { value: "behavioral", label: "Behavioral", description: "Situational and past-experience questions only." },
  { value: "technical", label: "Technical + Assessment", description: "Two role-specific technical questions plus one hands-on practical assessment — ready for Q&A and live tasks." },
  { value: "practical", label: "Practical only", description: "Hands-on, task-based exercises like a live coding round or take-home challenge." },
];
