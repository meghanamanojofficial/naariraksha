"""Database setup.

Default: a local SQLite file (works offline, no sign-up).
To use Supabase / Postgres, set DATABASE_URL in .env, e.g.
  DATABASE_URL=postgresql+psycopg://postgres:<password>@<host>:5432/postgres
"""
import os

from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./nariraksha.db"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)


def init_db() -> None:
    from . import models  # noqa: F401  (registers tables)

    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
