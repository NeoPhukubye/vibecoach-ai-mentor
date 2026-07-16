export { InterviewTypeSchema, INTERVIEW_TYPES } from "./interview-types";
export type { InterviewType } from "./interview-types";

export async function generateInterviewQuestions(data: {
  jobTitle: string;
  jobDescription: string;
  interviewType?: string;
}): Promise<{ questions: string[] } | null> {
  // Server function not available in static SPA mode.
  // Return mock questions based on job title for demo purposes.
  const type = data.interviewType || "mixed";
  const title = data.jobTitle;

  const questionSets: Record<string, string[]> = {
    mixed: [
      `Describe a technical challenge you faced in a previous ${title} role and how you solved it.`,
      `Tell me about a time you had to collaborate with a difficult team member. How did you handle it?`,
      `What motivates you about this ${title} position and how does it align with your career goals?`,
    ],
    behavioral: [
      `Describe a situation where you had to meet a tight deadline as a ${title}. What was the outcome?`,
      `Tell me about a time you received critical feedback. How did you respond?`,
      `Give an example of when you had to make a difficult decision with incomplete information.`,
    ],
    technical: [
      `Walk me through your approach to solving a complex problem relevant to the ${title} role.`,
      `How would you debug a production issue in a system you're unfamiliar with?`,
      `Practical assessment: Given the job description, design a small solution that addresses the core technical requirements.`,
    ],
    practical: [
      `Build a small feature that demonstrates your core skills for the ${title} role.`,
      `Given a typical scenario for this position, walk through your step-by-step approach.`,
      `Debug this described issue: A key system component is returning incorrect results intermittently.`,
    ],
  };

  return { questions: questionSets[type] || questionSets.mixed };
}
