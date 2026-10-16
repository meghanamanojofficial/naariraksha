"""Speech-to-text fallback: transcribe a short recording with Gemini.

Used when the browser has no built-in speech recognition (Firefox, Safari) or it fails.
Audio is processed in memory and never stored.
"""
import os

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from .services import llm

router = APIRouter(prefix="/api", tags=["speech"])

MAX_BYTES = 10 * 1024 * 1024  # ~10 MB, a couple of minutes of compressed audio
ALLOWED = ("audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/aac", "audio/mp3")

PROMPT = """Transcribe this audio recording exactly as spoken. The speaker is most likely speaking {language}
(she may mix Malayalam and English). Write Malayalam in Malayalam script and English in English.
Return ONLY the transcript text: no quotes, labels, translation or commentary.
If there is no clear speech, return an empty string."""


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), language: str = Form("English")):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(503, "Voice transcription needs GEMINI_API_KEY in backend/.env. Please type instead.")
    mime = (audio.content_type or "audio/webm").split(";")[0].strip()
    if mime not in ALLOWED:
        raise HTTPException(415, f"Unsupported audio format: {mime}")
    data = await audio.read()
    if not data:
        raise HTTPException(400, "Empty recording.")
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Recording too long. Please keep it under 2 minutes.")

    from google.genai import types

    try:
        resp = llm._client().models.generate_content(
            model=llm.MODEL,
            contents=[PROMPT.format(language=language), types.Part.from_bytes(data=data, mime_type=mime)],
            config=types.GenerateContentConfig(temperature=0),
        )
        text = (resp.text or "").strip().strip('"')
    except Exception as e:
        llm.LAST_ERROR = f"{type(e).__name__}: {e}"[:300]
        raise HTTPException(502, "Could not transcribe right now. Please type instead.")
    return {"text": text}
