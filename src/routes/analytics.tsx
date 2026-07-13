import { createFileRoute } from "@tanstack/react-router";
import { Award, MessageSquareText, AlertTriangle, Mail, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Performance Analytics — VibeCoach" },
      { name: "description", content: "Detailed breakdown of your interview performance including score, clarity, and filler words." },
    ],
  }),
  component: Analytics,
});

const FEEDBACK = [
  { type: "good", title: "Strong structural storytelling", detail: "You framed answers with clear situation, action, and result. Great use of the STAR method in Q2." },
  { type: "warn", title: "Watch pacing during technical detail", detail: "Speech rate climbed to 190 wpm during Q1. Aim for 140-160 to help interviewers follow along." },
  { type: "good", title: "Confident closing statements", detail: "You landed each answer with a decisive summary — this reads as senior-level clarity." },
  { type: "warn", title: "Reduce hedging language", detail: "Phrases like 'kind of' and 'I guess' appeared 6 times. Swap for direct claims to project authority." },
  { type: "good", title: "Concrete metrics referenced", detail: "You cited specific outcomes (27% engagement lift, $2M ARR) — hiring managers love this." },
];

function Analytics() {
  return (
    <div className="min-h-full gradient-hero">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-accent backdrop-blur">
              <Sparkles className="h-3 w-3" /> Session complete
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Performance report</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Senior Product Designer · 3 questions · 11m 42s
            </p>
          </div>
          <Button size="lg" className="gradient-accent text-accent-foreground shadow-accent-glow transition-all hover:scale-[1.02] hover:brightness-110">
            <Mail className="mr-2 h-4 w-4" />
            Export Detailed PDF via Email
          </Button>
        </div>

        {/* Metric cards */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <Card className="relative overflow-hidden border-border/60 bg-card/70 p-6 backdrop-blur">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/20 text-primary">
                  <Award className="h-5 w-5" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-accent">
                  <TrendingUp className="h-3 w-3" /> +8
                </span>
              </div>
              <p className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Overall Score
              </p>
              <p className="mt-1 font-display text-5xl font-bold">
                87<span className="text-2xl text-muted-foreground">/100</span>
              </p>
              <Progress value={87} className="mt-4 h-2" />
            </div>
          </Card>

          <Card className="border-border/60 bg-card/70 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/20 text-accent">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                Excellent
              </span>
            </div>
            <p className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Clarity Rating
            </p>
            <p className="mt-1 font-display text-5xl font-bold">
              9.2<span className="text-2xl text-muted-foreground">/10</span>
            </p>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i < 9 ? "bg-accent" : "bg-muted"}`} />
              ))}
            </div>
          </Card>

          <Card className="border-border/60 bg-card/70 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-destructive/20 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
                Watch out
              </span>
            </div>
            <p className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Filler Words
            </p>
            <p className="mt-1 font-display text-5xl font-bold">
              14<span className="text-2xl text-muted-foreground"> total</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-md bg-muted px-2 py-0.5">um · 6</span>
              <span className="rounded-md bg-muted px-2 py-0.5">like · 5</span>
              <span className="rounded-md bg-muted px-2 py-0.5">you know · 3</span>
            </div>
          </Card>
        </div>

        {/* Feedback list */}
        <Card className="border-border/60 bg-card/70 p-6 backdrop-blur sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Detailed feedback</h2>
              <p className="text-sm text-muted-foreground">Prioritized coaching notes from this session.</p>
            </div>
          </div>

          <ul className="divide-y divide-border/60">
            {FEEDBACK.map((item, i) => (
              <li key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    item.type === "good" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {item.type === "good" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
