import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  MessageSquareText,
  AlertTriangle,
  Mail,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Loader2,
  Rocket,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { listMyInterviewSessions } from "@/lib/sessions.functions";
import { INTERVIEW_TYPES } from "@/lib/interview.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function interviewTypeLabel(value?: string) {
  return INTERVIEW_TYPES.find((t) => t.value === value)?.label ?? "Mixed";
}

type FeedbackItem = { type: "good" | "warn"; title: string; detail: string };
type SessionRow = {
  id: string;
  job_title: string;
  interview_type?: string;
  overall_score: number;
  clarity_rating: number;
  filler_count: number;
  filler_breakdown: Record<string, number>;
  feedback: FeedbackItem[];
  duration_seconds: number;
  created_at: string;
};

export const Route = createFileRoute("/analytics")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    session: typeof s.session === "string" ? s.session : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Performance Analytics — VibeCoach" },
      { name: "description", content: "Track your interview practice history — overall score, clarity, filler words, and improvement over time." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const navigate = useNavigate();
  const { session: selectedIdFromUrl } = Route.useSearch();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  const { data, isLoading, error } = useQuery({
    enabled: authed === true,
    queryKey: ["interview-sessions"],
    queryFn: () => listMyInterviewSessions(),
  });

  useEffect(() => {
    if (authed === false) {
      toast.error("Sign in to see your performance history");
      navigate({ to: "/auth" });
    }
  }, [authed, navigate]);

  const sessions = (data?.sessions ?? []) as unknown as SessionRow[];
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedIdFromUrl);
  useEffect(() => {
    if (!selectedId && sessions.length > 0) setSelectedId(sessions[0].id);
  }, [sessions, selectedId]);

  const selected = useMemo(
    () => sessions.find((s) => s.id === selectedId) ?? sessions[0],
    [sessions, selectedId],
  );

  const previous = useMemo(() => {
    if (!selected) return undefined;
    const idx = sessions.findIndex((s) => s.id === selected.id);
    return idx >= 0 && idx < sessions.length - 1 ? sessions[idx + 1] : undefined;
  }, [sessions, selected]);

  if (authed === null || (authed && isLoading)) {
    return (
      <div className="grid min-h-full place-items-center p-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your history…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-full place-items-center p-10">
        <p className="text-sm text-destructive">Could not load your sessions.</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="grid min-h-full place-items-center gradient-hero p-10">
        <Card className="max-w-md border-border/60 bg-card/70 p-8 text-center backdrop-blur">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold">No sessions yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Finish your first practice interview and your scores will show up here — including your improvement trend.
          </p>
          <Button asChild size="lg" className="mt-6 w-full gradient-primary">
            <Link to="/">
              <Rocket className="h-4 w-4" /> Start a session
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const scoreDelta = previous ? selected.overall_score - previous.overall_score : 0;
  const clarityDelta = previous ? +(selected.clarity_rating - previous.clarity_rating).toFixed(1) : 0;
  const fillerDelta = previous ? selected.filler_count - previous.filler_count : 0;
  const avgScore = Math.round(sessions.reduce((a, s) => a + s.overall_score, 0) / sessions.length);
  const bestScore = Math.max(...sessions.map((s) => s.overall_score));

  return (
    <div className="min-h-full gradient-hero">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-accent backdrop-blur">
              <Sparkles className="h-3 w-3" /> {sessions.length} session{sessions.length === 1 ? "" : "s"} tracked
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Performance report</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {selected.job_title} · {interviewTypeLabel(selected.interview_type)} format ·{" "}
              {new Date(selected.created_at).toLocaleString()} · {Math.round(selected.duration_seconds / 60)}m
            </p>
          </div>
          <Button size="lg" className="gradient-accent text-accent-foreground shadow-accent-glow transition-all hover:scale-[1.02] hover:brightness-110">
            <Mail className="mr-2 h-4 w-4" />
            Export Detailed PDF via Email
          </Button>
        </div>

        {/* Trend strip */}
        <Card className="mb-8 border-border/60 bg-card/70 p-6 backdrop-blur">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold">Progress over time</h2>
              <p className="text-xs text-muted-foreground">
                Avg score {avgScore}/100 · Best {bestScore}/100 · Latest {sessions[0].overall_score}/100
              </p>
            </div>
            {previous && (
              <DeltaBadge
                value={scoreDelta}
                label={scoreDelta >= 0 ? "vs previous" : "vs previous"}
              />
            )}
          </div>
          <TrendChart sessions={sessions} selectedId={selected.id} onSelect={setSelectedId} />
        </Card>

        {/* Improvement summary */}
        <Card className="mb-8 border-border/60 bg-card/70 p-6 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold">Session summary</h2>
              <p className="mt-1 text-sm text-muted-foreground">{buildSummary(selected, previous, sessions)}</p>
            </div>
          </div>
        </Card>

        {/* Metric cards */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <MetricCard
            icon={<Award className="h-5 w-5" />}
            iconClass="bg-primary/20 text-primary"
            label="Overall Score"
            value={<>{selected.overall_score}<span className="text-2xl text-muted-foreground">/100</span></>}
            delta={previous ? scoreDelta : null}
            progressValue={selected.overall_score}
            gradient
          />
          <MetricCard
            icon={<MessageSquareText className="h-5 w-5" />}
            iconClass="bg-accent/20 text-accent"
            label="Clarity Rating"
            value={<>{selected.clarity_rating.toFixed(1)}<span className="text-2xl text-muted-foreground">/10</span></>}
            delta={previous ? clarityDelta : null}
            bars={Math.round(selected.clarity_rating)}
          />
          <MetricCard
            icon={<AlertTriangle className="h-5 w-5" />}
            iconClass="bg-destructive/20 text-destructive"
            label="Filler Words"
            value={<>{selected.filler_count}<span className="text-2xl text-muted-foreground"> total</span></>}
            delta={previous ? -fillerDelta : null}
            tags={Object.entries(selected.filler_breakdown).map(([k, v]) => `${k} · ${v}`)}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Feedback list */}
          <Card className="border-border/60 bg-card/70 p-6 backdrop-blur sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Detailed feedback</h2>
              <p className="text-sm text-muted-foreground">Prioritized coaching notes from this session.</p>
            </div>
            <ul className="divide-y divide-border/60">
              {selected.feedback.map((item, i) => (
                <li key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div
                    className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                      item.type === "good" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {item.type === "good" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Session history list */}
          <Card className="border-border/60 bg-card/70 p-4 backdrop-blur">
            <p className="px-2 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Session history
            </p>
            <ul className="space-y-1">
              {sessions.map((s) => {
                const active = s.id === selected.id;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                        active ? "bg-primary/15 ring-1 ring-primary/30" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.job_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {interviewTypeLabel(s.interview_type)} ·{" "}
                          {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${active ? "text-primary" : ""}`}>{s.overall_score}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DeltaBadge({ value, label }: { value: number; label: string }) {
  const positive = value > 0;
  const zero = value === 0;
  const Icon = zero ? Minus : positive ? TrendingUp : TrendingDown;
  const cls = zero
    ? "bg-muted text-muted-foreground"
    : positive
    ? "bg-accent/15 text-accent"
    : "bg-destructive/15 text-destructive";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {value > 0 ? "+" : ""}{value} {label}
    </span>
  );
}

function MetricCard({
  icon,
  iconClass,
  label,
  value,
  delta,
  progressValue,
  bars,
  tags,
  gradient,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: React.ReactNode;
  delta: number | null;
  progressValue?: number;
  bars?: number;
  tags?: string[];
  gradient?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/70 p-6 backdrop-blur">
      {gradient && <div className="absolute inset-0 gradient-primary opacity-10" />}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${iconClass}`}>{icon}</div>
          {delta !== null && <DeltaBadge value={delta} label="" />}
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-5xl font-bold">{value}</p>
        {progressValue !== undefined && <Progress value={progressValue} className="mt-4 h-2" />}
        {bars !== undefined && (
          <div className="mt-4 flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < bars ? "bg-accent" : "bg-muted"}`} />
            ))}
          </div>
        )}
        {tags && (
          <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
            {tags.map((t) => (
              <span key={t} className="rounded-md bg-muted px-2 py-0.5">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function TrendChart({
  sessions,
  selectedId,
  onSelect,
}: {
  sessions: SessionRow[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  // Oldest → newest
  const ordered = [...sessions].reverse();
  const max = 100;
  const width = 100; // percentage-based viewBox
  const height = 40;
  const step = ordered.length > 1 ? width / (ordered.length - 1) : 0;
  const points = ordered.map((s, i) => {
    const x = ordered.length > 1 ? i * step : width / 2;
    const y = height - (s.overall_score / max) * height;
    return { x, y, s };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const areaPath = `${path} L${points[points.length - 1].x.toFixed(2)},${height} L${points[0].x.toFixed(2)},${height} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-32 w-full">
        <defs>
          <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.19 155)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.72 0.19 155)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trendGrad)" />
        <path d={path} fill="none" stroke="oklch(0.72 0.19 155)" strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p) => {
          const active = p.s.id === selectedId;
          return (
            <circle
              key={p.s.id}
              cx={p.x}
              cy={p.y}
              r={active ? 1.4 : 0.9}
              fill={active ? "oklch(0.72 0.19 155)" : "oklch(0.95 0 0)"}
              stroke="oklch(0.72 0.19 155)"
              strokeWidth="0.4"
              className="cursor-pointer"
              onClick={() => onSelect(p.s.id)}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{new Date(ordered[0].created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        <span>Now</span>
      </div>
    </div>
  );
}
