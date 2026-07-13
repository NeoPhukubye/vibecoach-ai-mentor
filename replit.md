# VibeCoach — AI Interview Simulator

## Overview
A TanStack Start (React 19 + Vite) frontend, imported from Lovable, paired with a
new FastAPI backend that generates tailored interview questions using Google's
Gemini API.

## Stack
- **Frontend**: TanStack Start / TanStack Router, React 19, Tailwind v4, shadcn/ui
  components, package manager: Bun. Source in `src/`.
- **Backend**: FastAPI (Python 3.12), in `backend/main.py`. Uses the official
  `google-genai` SDK to call the `gemini-2.5-flash` model.

## Running the project
Two workflows are configured and start automatically:
- **Frontend** — `bun run dev`, served on port 5000 (the webview/preview).
- **Backend API** — `python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`,
  a console-only service on port 8000.

## Backend API
`POST /api/generate-questions`
- Body: `{ "job_title": string, "job_description": string }`
- Response: `{ "questions": [string, string, string] }` — one technical, one
  situational, one cultural-fit question.
- CORS is enabled for all origins so a frontend hosted elsewhere (e.g. a Lovable
  preview domain) can call this API directly.
- Requires the `GEMINI_API_KEY` secret (already configured). Failures from the
  Gemini API are caught and returned as a 500 with a descriptive message.

Note: the frontend's Interview route currently uses hardcoded sample questions
and does not yet call this endpoint — wiring the setup form to
`/api/generate-questions` is a natural next step (see follow-up tasks).

## User preferences
- Prefers Google's Gemini API over Anthropic's Claude for AI question generation.
