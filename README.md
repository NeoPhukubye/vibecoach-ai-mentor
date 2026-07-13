# VibeCoach — AI Interview Simulator

Practice for your next interview with tailored, AI-generated questions. Paste in a job title and description, and VibeCoach's backend calls Google Gemini to produce a technical, a situational, and a cultural-fit question — then walks you through a mock interview session with performance analytics.

## Features

- **Setup dashboard** — enter a job title and description to configure a practice session
- **AI-generated questions** — a FastAPI backend calls Google's Gemini API (`gemini-2.5-flash`) to generate one technical, one situational, and one cultural-fit question tailored to the role
- **Interview room** — timed mock interview flow for answering the generated questions
- **Performance analytics** — review scores and session history

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | [TanStack Start](https://tanstack.com/start) + TanStack Router, React 19, Tailwind CSS v4, shadcn/ui, Vite 8 |
| Backend | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12), [google-genai](https://pypi.org/project/google-genai/) SDK |
| Package managers | [Bun](https://bun.sh/) (frontend), [uv](https://docs.astral.sh/uv/) (backend) |

## Project structure

```
├── src/                    # Frontend source
│   ├── routes/              # File-based routes (TanStack Router)
│   │   ├── index.tsx           # Setup dashboard
│   │   ├── interview.tsx       # Interview room
│   │   ├── analytics.tsx       # Performance analytics
│   │   └── __root.tsx          # App shell / layout
│   ├── components/           # UI components (shadcn/ui based)
│   └── lib/                  # Shared utilities
├── backend/
│   └── main.py               # FastAPI app: /api/generate-questions endpoint
├── vite.config.ts           # Vite / TanStack Start / Nitro build config
└── pyproject.toml           # Backend Python dependencies
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) for the frontend
- Python 3.12+ with [uv](https://docs.astral.sh/uv/) for the backend
- A `GEMINI_API_KEY` (get one from [Google AI Studio](https://aistudio.google.com/apikey))

### Setup

1. Install frontend dependencies:
   ```bash
   bun install
   ```
2. Install backend dependencies:
   ```bash
   uv sync
   ```
3. Set the `GEMINI_API_KEY` environment variable so the backend can call Gemini.

### Run

Run the two services in separate terminals:

```bash
# Frontend — served on http://localhost:5000
bun run dev

# Backend API — served on http://localhost:8000
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

On Replit, both are already wired up as workflows (**Frontend** and **Backend API**) that start automatically.

### Build for production

```bash
bun run build
```

This produces a Node-runnable server in `.output/` (via Nitro's `node-server` preset).

## Backend API

### `POST /api/generate-questions`

Generates three interview questions tailored to a job.

**Request body:**
```json
{
  "job_title": "Senior Product Designer",
  "job_description": "..."
}
```

**Response:**
```json
{
  "questions": [
    "Technical question...",
    "Situational question...",
    "Cultural-fit question..."
  ]
}
```

Requires `GEMINI_API_KEY` to be set. Errors from the Gemini API are returned as HTTP 500 with a descriptive message. CORS is open to all origins so the frontend can call it from any host.

### `GET /`

Health check — returns `{ "status": "ok" }`.

## Deployment

The app deploys as a single autoscale service: the build step runs `bun run build`, and the run command starts both the FastAPI backend and the built Node frontend server side by side. Make sure `GEMINI_API_KEY` is set in the production environment as well as development.

## Notes

- The Interview route currently uses sample questions; wiring the setup form to `/api/generate-questions` is tracked as a follow-up.
- This project was originally imported from Lovable and adapted to run on Replit.
