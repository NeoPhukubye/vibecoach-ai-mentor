import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const InterviewTypeSchema = z.enum(["mixed", "behavioral", "technical", "practical"]);
export type InterviewType = z.infer<typeof InterviewTypeSchema>;

export const INTERVIEW_TYPES: { value: InterviewType; label: string; description: string }[] = [
  { value: "mixed", label: "Mixed", description: "One technical, one behavioral, one culture-fit question." },
  { value: "behavioral", label: "Behavioral", description: "Situational and past-experience questions only." },
  { value: "technical", label: "Technical", description: "Role-specific technical questions — coding, systems, and problem-solving." },
  { value: "practical", label: "Practical assessment", description: "Hands-on, task-based exercises like a live coding round or take-home challenge." },
];

const InputSchema = z.object({
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
  interviewType: InterviewTypeSchema.default("mixed"),
});

const QuestionsSchema = z.object({
  questions: z.array(z.string()).length(3),
});

const PROMPT_BY_TYPE: Record<InterviewType, string> = {
  mixed:
    "Generate EXACTLY 3 highly targeted interview questions tailored to this specific job — one technical/role-specific, one situational/behavioral, one cultural-fit/motivation.",
  behavioral:
    "Generate EXACTLY 3 behavioral interview questions tailored to this specific job. Each should ask the candidate to describe a real past situation (use a STAR-style prompt: situation, task, action, result) that reveals how they'd handle the core responsibilities of this role.",
  technical:
    "Generate EXACTLY 3 technical interview questions tailored to this specific job. Focus on the concrete tools, languages, systems, or domain knowledge listed in the description — include at least one problem-solving or debugging scenario and, if relevant to the role, a coding or system-design question. Be specific enough that a candidate could answer out loud or on a whiteboard.",
  practical:
    "Generate EXACTLY 3 practical, hands-on assessment tasks tailored to this specific job — the kind of live exercise or take-home assignment a candidate for this role would actually be asked to complete (e.g. 'build a small feature that...', 'given this dataset/scenario, walk through how you would...', 'debug this described issue step by step'). Each item should read as a short, self-contained task brief with enough context to attempt it, not just a question.",
};

export const generateInterviewQuestions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are an elite recruiter interviewing a candidate for the role below. ${PROMPT_BY_TYPE[data.interviewType]} Reference concrete responsibilities or requirements from the description so the questions clearly could not be reused for a different role.

Job Title: ${data.jobTitle}

Job Description:
${data.jobDescription}

Return JSON matching {"questions": [q1, q2, q3]}.`;

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        output: Output.object({ schema: QuestionsSchema }),
        prompt,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        const text = (error as { text?: string }).text ?? "{}";
        try {
          const parsed = QuestionsSchema.safeParse(JSON.parse(text));
          if (parsed.success) return parsed.data;
        } catch {}
      }
      throw error;
    }
  });
