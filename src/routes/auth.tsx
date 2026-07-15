import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, TrendingUp, ShieldCheck, User as UserIcon, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleEmail = async (mode: "signin" | "signup") => {
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        router.invalidate();
        navigate({ to: "/" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      toast.error("Enter your email above first");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent — check your inbox");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Left showcase panel */}
      <div className="relative hidden overflow-hidden gradient-hero lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">VibeCoach</span>
        </Link>

        <div className="relative space-y-6">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Sharpen every answer.<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Track every win.</span>
          </h2>
          <p className="max-w-md text-muted-foreground">
            Sign in to save your practice sessions. VibeCoach measures your clarity, pacing, and filler words after every run — then shows exactly how much you're improving.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { icon: TrendingUp, label: "See your score trend across every session" },
              { icon: ShieldCheck, label: "Your recordings and history stay private" },
              { icon: Sparkles, label: "Questions tailored to the exact job you paste" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-card/70 text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} VibeCoach · Interview coaching, reimagined.
        </p>
      </div>

      {/* Right auth panel */}
      <div className="flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-primary shadow-glow lg:mx-0">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to pick up where you left off and keep tracking your progress.
            </p>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            {(["signin", "signup"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${mode}-email`}>Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={`${mode}-email`}
                      type="email"
                      autoComplete="email"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${mode}-password`}>Password</Label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={resetLoading}
                        className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                      >
                        {resetLoading ? "Sending…" : "Forgot password?"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={`${mode}-password`}
                      type={showPw ? "text" : "password"}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      className="pl-9 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                      onKeyDown={(e) => e.key === "Enter" && handleEmail(mode)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  onClick={() => handleEmail(mode)}
                  disabled={loading}
                  className="group w-full gradient-primary text-primary-foreground shadow-glow transition-all hover:brightness-110"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" ? "Sign in" : "Create account"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
                {mode === "signup" && (
                  <p className="text-center text-xs text-muted-foreground">
                    By creating an account you agree to save your interview practice history to your profile.
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
