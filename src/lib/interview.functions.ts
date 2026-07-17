import { supabase } from "@/integrations/supabase/client";

export {
  InterviewTypeSchema,
  INTERVIEW_TYPES,
  INTERVIEW_LANGUAGES,
  SENIORITY_LEVELS,
  SenioritySchema,
} from "./interview-types";
export type { InterviewType, InterviewLanguage, Seniority } from "./interview-types";

export interface PracticalTask {
  title: string;
  task: string;
}

export interface InterviewPlan {
  verbal: string[];
  practical: PracticalTask[];
  /** Flat list combining verbal + practical for legacy consumers */
  questions: string[];
}

export async function generateInterviewQuestions(data: {
  jobTitle: string;
  jobDescription: string;
  seniority?: string;
  interviewType?: string;
  language?: string;
}): Promise<InterviewPlan> {
  const { data: res, error } = await supabase.functions.invoke("generate-questions", {
    body: {
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      seniority: data.seniority ?? "mid",
      language: data.language ?? "en",
    },
  });
  if (error) throw new Error(error.message);
  const verbal: string[] = Array.isArray(res?.verbal) ? res.verbal : [];
  const practical: PracticalTask[] = Array.isArray(res?.practical) ? res.practical : [];
  if (verbal.length < 1 || practical.length < 1) {
    throw new Error("Could not generate an interview — please try again.");
  }
  const flatPractical = practical.map((p) => `Practical — ${p.title}\n\n${p.task}`);
  return { verbal, practical, questions: [...verbal, ...flatPractical] };
}

export async function generateFollowUp(data: {
  jobTitle: string;
  seniority?: string;
  language?: string;
  previousQuestion: string;
  previousAnswer: string;
  plannedNextQuestion?: string;
}): Promise<string> {
  const { data: res, error } = await supabase.functions.invoke("follow-up-question", {
    body: data,
  });
  if (error) throw new Error(error.message);
  return (res?.question as string) ?? data.plannedNextQuestion ?? "";
}
