ALTER TABLE public.interview_sessions
  ADD COLUMN IF NOT EXISTS interview_type TEXT NOT NULL DEFAULT 'mixed';

ALTER TABLE public.interview_sessions
  ADD CONSTRAINT interview_sessions_interview_type_check
  CHECK (interview_type IN ('mixed', 'behavioral', 'technical', 'practical'));
