import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { InterviewTypeSchema } from "@/lib/interview.functions";

const FeedbackItemSchema = z.object({
  type: z.enum(["good", "warn"]),
  title: z.string(),
  detail: z.string(),
});

const SaveSchema = z.object({
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
  interviewType: InterviewTypeSchema.default("mixed"),
  questions: z.array(z.string()),
  overallScore: z.number().int().min(0).max(100),
  clarityRating: z.number().min(0).max(10),
  fillerCount: z.number().int().min(0),
  fillerBreakdown: z.record(z.string(), z.number()),
  feedback: z.array(FeedbackItemSchema),
  durationSeconds: z.number().int().min(0),
});

export const saveInterviewSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SaveSchema.parse(data))
  .handler(async ({ data, context }) => {
    const baseRow = {
      user_id: context.userId,
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

    let { data: row, error } = await context.supabase
      .from("interview_sessions")
      .insert({ ...baseRow, interview_type: data.interviewType })
      .select("id")
      .single();

    // The `interview_type` column may not exist yet on this database (pending
    // migration). Fall back to saving without it so sessions keep working.
    if (error && (error.code === "42703" || error.message.includes("interview_type"))) {
      const retry = await context.supabase
        .from("interview_sessions")
        .insert(baseRow)
        .select("id")
        .single();
      row = retry.data;
      error = retry.error;
    }

    if (error) throw new Error(error.message);
    return { id: row!.id as string };
  });

export const listMyInterviewSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("interview_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { sessions: data ?? [] };
  });
