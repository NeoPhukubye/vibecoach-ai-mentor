import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Video, ChevronRight, ChevronLeft, BarChart3, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "Interview Room — VibeCoach" },
      { name: "description", content: "Live AI interview session with real-time video avatar and voice recording." },
    ],
  }),
  component: InterviewRoom,
});

const QUESTIONS = [
  "Tell me about a time you had to make a difficult product decision with limited data. Walk me through your process.",
  "How do you balance user needs with business goals when they conflict?",
  "Describe a project where you had to influence stakeholders without direct authority.",
];

function InterviewRoom() {
  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const total = QUESTIONS.length;

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Live Interview</h1>
            <p className="text-sm text-muted-foreground">Senior Product Designer · Simulated by VibeCoach AI</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
            LIVE
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Left: video avatar */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-border/60 bg-card/70 p-0 backdrop-blur">
              <div className="relative aspect-video w-full bg-gradient-to-br from-primary/30 via-background to-accent/20">
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="grid h-28 w-28 place-items-center rounded-full gradient-primary shadow-glow">
                      <Video className="h-12 w-12 text-primary-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-display text-lg font-semibold">Alex · AI Interviewer</p>
                      <p className="text-xs text-muted-foreground">Speaking...</p>
                    </div>
                  </div>
                </div>
                <div className="absolute left-4 top-4 rounded-md bg-background/60 px-2 py-1 text-xs backdrop-blur">
                  HD · Avatar Stream
                </div>
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md bg-background/60 px-2 py-1 text-xs backdrop-blur">
                  <Circle className="h-2 w-2 fill-accent text-accent" />
                  Connected
                </div>
              </div>

              {/* Audio wave */}
              <div className="border-t border-border/60 bg-card/80 p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Audio waveform
                </p>
                <div className="flex h-16 items-center justify-center gap-1">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full gradient-accent animate-wave"
                      style={{
                        height: `${30 + Math.sin(i * 0.5) * 40 + 30}%`,
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right: question panel */}
          <Card className="flex flex-col border-border/60 bg-card/70 p-6 backdrop-blur">
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">
                  Question <span className="text-foreground">{current + 1}</span> of {total}
                </span>
                <span className="text-accent">{Math.round(((current + 1) / total) * 100)}%</span>
              </div>
              <Progress value={((current + 1) / total) * 100} className="h-2" />
            </div>

            <div className="mb-6 flex-1 rounded-xl border border-border/60 bg-background/60 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-accent">Current question</p>
              <p className="mt-3 text-lg leading-relaxed sm:text-xl">{QUESTIONS[current]}</p>
            </div>

            {/* Record button */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <button
                onClick={() => setRecording((r) => !r)}
                className={`group relative grid h-24 w-24 place-items-center rounded-full transition-all ${
                  recording
                    ? "bg-destructive shadow-[0_0_0_8px_oklch(0.65_0.22_25/0.15)]"
                    : "gradient-primary shadow-glow hover:scale-105"
                }`}
              >
                {recording && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" />
                )}
                <Mic className="h-9 w-9 text-primary-foreground" />
              </button>
              <p className="text-sm font-medium">
                {recording ? "Recording... click to stop" : "Click to Record Answer"}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={current === 0}
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              {current < total - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrent((c) => c + 1)}
                  className="gradient-primary text-primary-foreground"
                >
                  Next question <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" asChild className="gradient-accent text-accent-foreground">
                  <Link to="/analytics">
                    Finish & see results <BarChart3 className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
