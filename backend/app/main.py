import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from .routers import router  # noqa: E402
from .seed import seed  # noqa: E402


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed()  # creates tables and loads seed_data/*.json if the DB is empty
    yield


app = FastAPI(title="NariRaksha API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"message": "NariRaksha API is running. Open /docs"}


@app.get("/health")
def health():
    return {"ok": True, "llm": "gemini" if os.getenv("GEMINI_API_KEY") else "offline"}
