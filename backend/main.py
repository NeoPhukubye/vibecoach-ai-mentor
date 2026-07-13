import json
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel

app = FastAPI(title="AI Interview Simulator API")

# Allow the frontend (which may be hosted on a different domain, e.g. Lovable)
# to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

SYSTEM_PROMPT = (
    "You are an elite recruiter. Generate exactly 3 highly targeted interview "
    "questions (one technical, one situational, one cultural fit) based on the "
    "provided job title and description. Respond strictly in valid JSON format "
    'matching this structure: {"questions": ["Q1", "Q2", "Q3"]}. Do not include '
    "any markdown formatting, thoughts, code blocks, or conversational intro/outro text."
)


class JobInput(BaseModel):
    job_title: str
    job_description: str


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/api/generate-questions")
def generate_questions(job_input: JobInput):
    user_message = (
        f"Job title: {job_input.job_title}\n" f"Job description: {job_input.job_description}"
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
            ),
        )

        raw_text = response.text
        questions = json.loads(raw_text)
        return questions
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate interview questions: {exc}",
        ) from exc
