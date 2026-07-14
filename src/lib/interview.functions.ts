import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
});

const QuestionsSchema = z.object({
  questions: z.array(z.string()).length(3),
});

export const generateInterviewQuestions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are an elite recruiter interviewing a candidate for the role below. Generate EXACTLY 3 highly targeted interview questions tailored to this specific job — one technical/role-specific, one situational/behavioral, one cultural-fit/motivation. Reference concrete responsibilities or requirements from the description so the questions clearly could not be reused for a different role.

Job Title: ${data.jobTitle}

Job Description:
${data.jobDescription}

Return JSON matching {"questions": [q1, q2, q3]}.`;

    try {
      const { experimental_output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        experimental_output: Output.object({ schema: QuestionsSchema }),
        prompt,
      });
      return experimental_output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        const parsed = QuestionsSchema.safeParse(JSON.parse(error.text ?? "{}"));
        if (parsed.success) return parsed.data;
      }
      throw error;
    }
  });
