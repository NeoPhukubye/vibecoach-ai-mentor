// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface Body {
  jobTitle: string;
  jobDescription: string;
  seniority?: string;
  language?: string;
}

const LANG_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", fr: "French", de: "German", pt: "Portuguese",
  zh: "Chinese (Mandarin)", ja: "Japanese", ko: "Korean", ar: "Arabic", hi: "Hindi",
  zu: "Zulu", af: "Afrikaans", sw: "Swahili", it: "Italian", nl: "Dutch",
  ru: "Russian", tr: "Turkish", pl: "Polish",
};

const SENIORITY_GUIDE: Record<string, string> = {
  intern: "Entry-level intern. Focus on fundamentals, learning mindset, curiosity, and basic role concepts. Keep practical tasks small and guided.",
  junior: "Junior (0-2 yrs). Test core skills, ability to follow patterns, ask good questions, and simple problem-solving.",
  mid: "Mid-level (2-5 yrs). Test ownership of features, trade-offs, debugging, and cross-team communication.",
  senior: "Senior (5-8 yrs). Test system design, mentoring, ambiguity handling, and driving quality/architecture decisions.",
  staff: "Staff / Principal (8+ yrs). Test org-wide technical leadership, cross-team strategy, deep architectural trade-offs, and influence without authority.",
  lead: "Team Lead / Manager. Test people leadership, delivery, stakeholder management, and balancing tech vs. team growth.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const { jobTitle, jobDescription, seniority = "mid", language = "en" } = (await req.json()) as Body;
    const langName = LANG_NAMES[language] ?? "English";
    const senGuide = SENIORITY_GUIDE[seniority] ?? SENIORITY_GUIDE.mid;

    const system = `You are an expert interviewer designing a role-specific interview.
Return STRICTLY valid JSON matching the schema. Write every question in ${langName}.
Calibrate difficulty and depth to this seniority: ${senGuide}
The interview MUST contain exactly 8 verbal questions and 2 practical questions (10 total).
- Verbal: a natural progression — 2 warm-up/background, 3 behavioral (STAR-style), 3 role-specific technical/knowledge questions. Each later question should be structured to naturally build on themes raised earlier so the interviewer can probe deeper.
- Practical: 2 hands-on tasks appropriate to the role and seniority (e.g. coding challenge, system design, case study, live exercise). Include clear success criteria in the "task" field.
Base every question on the actual job description provided. Avoid generic filler.`;

    const user = `Job title: ${jobTitle}
Seniority: ${seniority}
Job description:\n${jobDescription}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_interview",
              description: "Return the structured interview plan",
              parameters: {
                type: "object",
                properties: {
                  verbal: {
                    type: "array",
                    minItems: 8,
                    maxItems: 8,
                    items: { type: "string", description: "Verbal question text" },
                  },
                  practical: {
                    type: "array",
                    minItems: 2,
                    maxItems: 2,
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        task: { type: "string", description: "Full task description with success criteria" },
                      },
                      required: ["title", "task"],
                    },
                  },
                },
                required: ["verbal", "practical"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_interview" } },
      }),
    });

    if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit — try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (res.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = JSON.parse(call?.function?.arguments ?? "{}");
    const verbal: string[] = Array.isArray(args.verbal) ? args.verbal.slice(0, 8) : [];
    const practical: { title: string; task: string }[] = Array.isArray(args.practical) ? args.practical.slice(0, 2) : [];

    return new Response(JSON.stringify({ verbal, practical }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
