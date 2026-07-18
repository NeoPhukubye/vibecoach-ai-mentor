# VibeCoach — AI Interview Simulator

Practice for your next interview with an adaptive, AI-driven mock interviewer. Paste a job title, description, and seniority level and VibeCoach generates a full role-specific interview — 8 verbal questions plus 2 practical tasks — with follow-ups, live self-view video, and per-question scoring saved to your history.

## Features

### Interview experience
- **Setup dashboard** — enter a job title, paste the job description, pick a seniority level (Intern → Team Lead), an interview focus (Full / Behavioral / Technical / Practical), and an interview language.
- **Role-specific AI questions** — a Supabase Edge Function calls Google Gemini via the Lovable AI Gateway to generate every question fresh for the pasted role. No canned question banks.
- **8 verbal + 2 practical structure** — every session follows the same shape (2 warm-up, 3 behavioral, 3 role-specific, 2 practical tasks) with difficulty calibrated to the chosen seniority.
- **Adaptive follow-ups** — the interviewer builds on the candidate's notes:
  - Automatic follow-up: when you press *Next question* after a verbal answer, the AI can rewrite the upcoming question as a natural follow-up on what you actually said.
  - Manual follow-up: an **Ask follow-up** button asks the AI to insert a deeper probing sub-question on the current answer, so a candidate can practise being pushed harder in real time.
- **Timed phases** — a live countdown for each phase to mimic real interview pressure:
  - **Verbal phase: 25 minutes**
  - **Practical / technical assessment: 30 minutes**
  - Warns at under 1 minute; shows an *"time is up"* banner when the phase timer runs out.
- **Live self-view video** — mirrored webcam PIP so candidates get used to being on camera. Camera on/off toggle, graceful fallback if the browser blocks access.
- **AI interviewer avatar + waveform** — a stylised avatar panel with an animated audio waveform for immersion.
- **Multi-language interviews** — questions can be generated in 18 languages (English, Spanish, French, German, Portuguese, Mandarin, Japanese, Korean, Arabic, Hindi, Zulu, Afrikaans, Swahili, Italian, Dutch, Russian, Turkish, Polish).
- **Accessibility** — optional sign-language avatar mode and sign-recognition overlay for practising with different input/output modalities.

### Scoring and analytics
- **Per-question scoring** — every answer is scored out of 100 with a short coaching note (structure, specifics, coverage) and shown as its own card on the report.
- **Overall metrics** — overall score /100, clarity /10, and filler-word count with a breakdown of `um`, `like`, and `you know` tallies.
- **Progress over time** — sessions are persisted per user; the analytics page renders a trend chart, "vs previous session" deltas, and a written session summary comparing you against your own average.
- **Session history** — sidebar lets you jump between past sessions to compare feedback.
- **PDF export** — one-click download of a detailed report for the selected session.

### Accounts and persistence
- **Google sign-in** and email + password (with email verification and password reset) via Lovable Cloud auth.
- Sessions are stored in a Supabase Postgres table (`interview_sessions`) protected by row-level security — every user only sees their own history.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | TanStack Start + TanStack Router, React 18, Tailwind CSS, shadcn/ui, Vite |
| Backend | Lovable Cloud (Supabase) — Postgres, Auth, Edge Functions (Deno) |
| AI | Lovable AI Gateway → Google Gemini (`gemini-2.5-flash`) |
| Package manager | Bun |

## Project structure

```
├── src/
│   ├── routes/
│   │   ├── index.tsx        # Setup dashboard
│   │   ├── interview.tsx    # Live interview room (timers, follow-ups, video)
│   │   ├── analytics.tsx    # Performance report, per-question scoring, history
│   │   ├── auth.tsx         # Sign in / sign up / reset password
│   │   └── __root.tsx       # App shell + sidebar
│   ├── components/          # UI components (shadcn/ui based)
│   ├── lib/                 # Interview + session helpers, PDF export
│   └── integrations/supabase # Auto-generated Supabase client + types
├── supabase/
│   ├── functions/
│   │   ├── generate-questions/   # Builds the 8+2 interview plan
│   │   └── follow-up-question/   # Generates adaptive follow-up questions
│   └── migrations/               # Database schema (interview_sessions, question_scores)
└── vite.config.ts
```

## Getting started

```bash
bun install
bun run dev
```

Lovable Cloud (Supabase) is provisioned automatically; the AI Gateway key is already configured. Open the app, sign up (or continue with Google), and launch your first interview from the setup dashboard.

## Build for production

```bash
bun run build
```
