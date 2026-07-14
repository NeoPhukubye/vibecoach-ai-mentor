
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  clarity_rating NUMERIC(3,1) NOT NULL CHECK (clarity_rating BETWEEN 0 AND 10),
  filler_count INTEGER NOT NULL DEFAULT 0,
  filler_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  feedback JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_sessions TO authenticated;
GRANT ALL ON public.interview_sessions TO service_role;

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions" ON public.interview_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.interview_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.interview_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON public.interview_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_interview_sessions_user_created
  ON public.interview_sessions(user_id, created_at DESC);
