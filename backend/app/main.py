import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from .clients import router as clients_router  # noqa: E402
from .routers import router  # noqa: E402
from .speech import router as speech_router  # noqa: E402
from .seed import seed  # noqa: E402


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed(reset=True)  # reloads seed_data/*.json on every start, so edits show up after a restart
    yield


app = FastAPI(title="NariRaksha API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(clients_router)
app.include_router(speech_router)


@app.get("/")
def root():
    return {"message": "NariRaksha API is running. Open /docs"}


@app.get("/health")
def health():
    from .services import llm

    return {
        "ok": True,
        "llm": "gemini" if os.getenv("GEMINI_API_KEY") else "offline (GEMINI_API_KEY not set in backend/.env)",
        "model": llm.MODEL,
        "last_llm_error": llm.LAST_ERROR,
    }
