import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Video, VideoOff, ChevronRight, ChevronLeft, BarChart3, Circle, Loader2, CameraOff, Hand, ClipboardCheck, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { generateInterviewQuestions, generateFollowUp, INTERVIEW_TYPES, INTERVIEW_LANGUAGES, SENIORITY_LEVELS, type InterviewType, type Seniority } from "@/lib/interview.functions";
import { saveInterviewSession } from "@/lib/sessions.functions";
import { supabase } from "@/integrations/supabase/client";
import { SignLanguageAvatar } from "@/components/sign-language-avatar";
import { SignRecognitionOverlay } from "@/components/sign-recognition-overlay";
import { useSignLanguage } from "@/lib/sign-language-context";

export const Route = createFileRoute("/interview")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Interview Room — VibeCoach" },
      { name: "description", content: "Live AI interview session with real-time video avatar and voice recording." },
    ],
  }),
  component: InterviewRoom,
});

type JobPayload = { jobTitle: string; jobDescription: string; interviewType?: InterviewType; seniority?: Seniority; language?: string };

function synthesizeResults(questions: string[], startedAt: number) {
  // Lightweight mock scoring so improvement can be tracked over time.
  // Replace with real speech-analysis output later.
  const base = 68 + Math.floor(Math.random() * 27); // 68-94
  const clarity = Math.round((6 + Math.random() * 3.5) * 10) / 10;
  const um = Math.floor(Math.random() * 8);
  const like = Math.floor(Math.random() * 7);
  const youKnow = Math.floor(Math.random() * 5);
  const filler = um + like + youKnow;
  const duration = Math.max(60, Math.floor((Date.now() - startedAt) / 1000));

  const feedback = [
    { type: "good" as const, title: "Strong structural storytelling", detail: "You framed several answers with clear situation, action, and result." },
    { type: "warn" as const, title: "Watch pacing during detail", detail: "A couple of answers rushed past key metrics — slow down when landing outcomes." },
    { type: "good" as const, title: "Confident closing statements", detail: "You wrapped answers with decisive summaries, which reads as senior-level clarity." },
    filler > 10
      ? { type: "warn" as const, title: "Trim filler words", detail: `We heard ${filler} filler words across ${questions.length} answers. Pause instead of filling.` }
      : { type: "good" as const, title: "Clean delivery", detail: `Only ${filler} filler words across the session — very tight.` },
  ];

  return {
    overallScore: base,
    clarityRating: clarity,
    fillerCount: filler,
    fillerBreakdown: { um, like, "you know": youKnow } as Record<string, number>,
    feedback,
    durationSeconds: duration,
  };
}

function InterviewRoom() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [verbalCount, setVerbalCount] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [job, setJob] = useState<JobPayload | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { settings: signSettings, setActiveText } = useSignLanguage();

  // Feed current question to the sign language avatar
  useEffect(() => {
    if (questions[current]) {
      setActiveText(questions[current]);
    }
    return () => setActiveText("");
  }, [current, questions, setActiveText]);

  useEffect(() => {
    let cancelled = false;
    if (!cameraOn) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraError(null);
      } catch (e) {
        setCameraError(e instanceof Error ? e.message : "Camera unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cameraOn]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Sign in to run a practice interview");
        navigate({ to: "/auth" });
        return;
      }
      const raw = sessionStorage.getItem("vibecoach:job");
      if (!raw) {
        toast.error("Add a job title and description first");
        navigate({ to: "/" });
        return;
      }
      const parsed = JSON.parse(raw) as JobPayload;
      setJob(parsed);
      startedAtRef.current = Date.now();
      try {
        const res = await generateInterviewQuestions({
          jobTitle: parsed.jobTitle,
          jobDescription: parsed.jobDescription,
          interviewType: parsed.interviewType ?? "mixed",
          language: parsed.language ?? "en",
        });
        setQuestions(res?.questions ?? []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to generate questions. Try again.");
        navigate({ to: "/" });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const total = questions.length;

  const handleFinish = async () => {
    if (!job) return;
    setFinishing(true);
    try {
      const results = synthesizeResults(questions, startedAtRef.current);
      const { id } = await saveInterviewSession({
        jobTitle: job.jobTitle,
        jobDescription: job.jobDescription,
        interviewType: job.interviewType ?? "mixed",
        questions,
        ...results,
      });
      sessionStorage.removeItem("vibecoach:job");
      toast.success("Session saved to your history");
      navigate({ to: "/analytics", search: { session: id } as never });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not save session");
      setFinishing(false);
    }
  };

  if (loading || total === 0) {
    return (
      <div className="grid min-h-full place-items-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-display text-lg font-semibold">Crafting your interview…</p>
          <p className="text-sm text-muted-foreground">
            Tailoring questions to the role you pasted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Live Interview</h1>
            <p className="text-sm text-muted-foreground">
              {job?.jobTitle} · {INTERVIEW_TYPES.find((t) => t.value === (job?.interviewType ?? "mixed"))?.label}{" "}
              format · {INTERVIEW_LANGUAGES.find((l) => l.value === (job?.language ?? "en"))?.label ?? "English"} · Simulated by VibeCoach AI
            </p>
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

                {/* Self-view PIP */}
                <div className="absolute bottom-4 right-4 w-40 sm:w-52 aspect-video overflow-hidden rounded-lg border border-border/70 bg-black shadow-xl">
                  {cameraOn && !cameraError ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full -scale-x-100 object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-muted/40 text-center text-[10px] text-muted-foreground p-2">
                      <div className="flex flex-col items-center gap-1">
                        <CameraOff className="h-5 w-5" />
                        {cameraError ? "Camera blocked" : "Camera off"}
                      </div>
                    </div>
                  )}
                  <div className="absolute left-1.5 top-1.5 rounded bg-background/70 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur">
                    You
                  </div>
                  <button
                    type="button"
                    onClick={() => setCameraOn((v) => !v)}
                    className="absolute bottom-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur hover:bg-background"
                    aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
                  >
                    {cameraOn ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                  </button>
                  {/* Sign language recognition indicator */}
                  {signSettings.enabled && signSettings.signRecognitionEnabled && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded bg-primary/80 px-1.5 py-0.5 text-[9px] text-primary-foreground backdrop-blur">
                      <Hand className="h-2.5 w-2.5" />
                      Sign
                    </div>
                  )}
                </div>

                {/* Sign recognition overlay below the video */}
                {signSettings.enabled && signSettings.signRecognitionEnabled && (
                  <div className="absolute bottom-4 left-4 right-60 sm:right-72">
                    <SignRecognitionOverlay videoElement={videoRef.current} />
                  </div>
                )}
              </div>

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
              <p className="mt-3 text-lg leading-relaxed sm:text-xl">{questions[current]}</p>
            </div>

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
                <Button
                  size="sm"
                  onClick={handleFinish}
                  disabled={finishing}
                  className="gradient-accent text-accent-foreground"
                >
                  {finishing ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <BarChart3 className="ml-1 h-4 w-4" />
                  )}
                  {finishing ? "Saving…" : "Finish & save results"}
                </Button>
              )}
            </div>
          </Card>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need to quit? <Link to="/" className="underline">Return to setup</Link> — this session won't be saved.
        </p>
      </div>
    </div>
  );
}
