import { supabase } from "@/integrations/supabase/client";
import type { InterviewType } from "./interview-types";

export async function saveInterviewSession(data: {
  jobTitle: string;
  jobDescription: string;
  interviewType?: InterviewType;
  questions: string[];
  overallScore: number;
  clarityRating: number;
  fillerCount: number;
  fillerBreakdown: Record<string, number>;
  feedback: { type: string; title: string; detail: string }[];
  durationSeconds: number;
}): Promise<{ id: string }> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error("Not authenticated");

  const baseRow = {
    user_id: session.session.user.id,
    job_title: data.jobTitle,
    job_description: data.jobDescription,
    questions: data.questions,
    overall_score: data.overallScore,
    clarity_rating: data.clarityRating,
    filler_count: data.fillerCount,
    filler_breakdown: data.fillerBreakdown,
    feedback: data.feedback,
    duration_seconds: data.durationSeconds,
  };

  let { data: row, error } = await supabase
    .from("interview_sessions")
    .insert({ ...baseRow, interview_type: data.interviewType } as never)
    .select("id")
    .single();

  if (error && (error.code === "42703" || error.message.includes("interview_type"))) {
    const retry = await supabase
      .from("interview_sessions")
      .insert(baseRow)
      .select("id")
      .single();
    row = retry.data;
    error = retry.error;
  }

  if (error) throw new Error(error.message);
  return { id: row!.id as string };
}

export async function listMyInterviewSessions() {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return { sessions: data ?? [] };
}
