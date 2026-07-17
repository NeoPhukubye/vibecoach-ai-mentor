// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const LANG_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", fr: "French", de: "German", pt: "Portuguese",
  zh: "Chinese (Mandarin)", ja: "Japanese", ko: "Korean", ar: "Arabic", hi: "Hindi",
  zu: "Zulu", af: "Afrikaans", sw: "Swahili", it: "Italian", nl: "Dutch",
  ru: "Russian", tr: "Turkish", pl: "Polish",
};

interface Body {
  jobTitle: string;
  seniority?: string;
  language?: string;
  previousQuestion: string;
  previousAnswer: string;
  plannedNextQuestion?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const { jobTitle, seniority = "mid", language = "en", previousQuestion, previousAnswer, plannedNextQuestion } =
      (await req.json()) as Body;
    const langName = LANG_NAMES[language] ?? "English";

    const system = `You are an expert live interviewer for a ${jobTitle} role at seniority "${seniority}".
Listen to the candidate's previous answer and craft ONE natural follow-up question that:
- Digs deeper into a specific skill, experience, or claim they mentioned
- Probes gaps, trade-offs, metrics, or their decision-making process
- Feels conversational, not scripted
- Is written in ${langName}
Return only the follow-up question text — no preamble, no quotes.
If the candidate's answer was empty or too shallow to build on, refine and re-ask the planned next question instead so it prompts a concrete example.`;

    const user = `Previous question: ${previousQuestion}
Candidate answer: ${previousAnswer || "(no answer provided)"}
Planned next question (fallback): ${plannedNextQuestion ?? "(none)"}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (res.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content?.trim() ?? "";
    return new Response(JSON.stringify({ question: text || plannedNextQuestion || "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
