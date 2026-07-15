import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Rocket, Briefcase, FileText, Sparkles, Target, Timer, Layers, Users, Code2, ClipboardCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { INTERVIEW_TYPES, type InterviewType } from "@/lib/interview.functions";

const TYPE_ICONS: Record<InterviewType, typeof Layers> = {
  mixed: Layers,
  behavioral: Users,
  technical: Code2,
  practical: ClipboardCheck,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Setup — VibeCoach" },
      { name: "description", content: "Configure your AI interview practice session by pasting a job description." },
    ],
  }),
  component: SetupDashboard,
});

function SetupDashboard() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("mixed");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const metaName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined);
  const firstName = metaName?.trim().split(/\s+/)[0] ?? user?.email?.split("@")[0];

  return (
    <div className="relative min-h-full gradient-hero">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-accent" />
            Welcome back, {firstName}
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Let's ace your next <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">interview</span>.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Drop in the role you're targeting and paste the job description. Our AI coach will
            generate tailored questions and grade your delivery in real time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <Card className="border-border/60 bg-card/70 p-6 backdrop-blur sm:p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Job Title
                </label>
                <Input
                  placeholder="e.g. Senior Product Designer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-12 border-border/60 bg-background/60 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-primary" />
                  Job Description
                </label>
                <Textarea
                  placeholder="Paste the full job description here. Include responsibilities, requirements, and any nice-to-haves..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[280px] resize-none border-border/60 bg-background/60 text-sm leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  {jobDescription.length} characters · The more detail, the sharper the questions.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Layers className="h-4 w-4 text-primary" />
                  Interview format
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {INTERVIEW_TYPES.map(({ value, label, description }) => {
                    const Icon = TYPE_ICONS[value];
                    const active = interviewType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setInterviewType(value)}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-primary/60 bg-primary/10 ring-1 ring-primary/40"
                            : "border-border/60 bg-background/60 hover:border-border"
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Your data stays private and isn't stored between sessions.
                </p>
                <Button
                  size="lg"
                  disabled={!jobTitle.trim() || !jobDescription.trim()}
                  onClick={() => {
                    sessionStorage.setItem(
                      "vibecoach:job",
                      JSON.stringify({ jobTitle, jobDescription, interviewType })
                    );
                    navigate({ to: "/interview" });
                  }}
                  className="group h-12 gradient-primary px-6 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] hover:brightness-110"
                >
                  <Rocket className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  Launch AI Interview
                </Button>
              </div>
            </div>
          </Card>

          {/* Side stats */}
          <div className="space-y-4">
            <Card className="border-border/60 bg-card/70 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Last score</p>
                  <p className="text-xs text-muted-foreground">Product Designer role</p>
                </div>
              </div>
              <p className="mt-4 font-display text-4xl font-bold">
                82<span className="text-lg text-muted-foreground">/100</span>
              </p>
            </Card>

            <Card className="border-border/60 bg-card/70 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent">
                  <Timer className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Session length</p>
                  <p className="text-xs text-muted-foreground">3 questions · ~12 min</p>
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-2 flex-1 rounded-full bg-accent/60" />
                ))}
              </div>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-primary/20 to-accent/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold">Pro tip</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Speak in complete thoughts and pause between points. The coach rewards clarity over speed.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
