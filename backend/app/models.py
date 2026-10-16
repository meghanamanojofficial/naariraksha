"""Database tables. Content lives in app/seed_data/*.json and is loaded by app/seed.py."""
from datetime import datetime, timezone

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class CrimeLaw(SQLModel, table=True):
    crime_id: int = Field(foreign_key="crime.id", primary_key=True)
    law_id: int = Field(foreign_key="law.id", primary_key=True)


class Law(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True)  # e.g. "BNS-78"
    act: str
    section: str
    old_act: str | None = None  # IPC / CrPC / Indian Evidence Act equivalent
    old_section: str | None = None
    title: str
    plain_en: str
    plain_ml: str | None = None
    cognizable: bool | None = None
    bailable: bool | None = None


class Crime(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    name: str
    category: str
    summary: str
    keywords: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    evidence: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    documents: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    authority_types: list[str] = Field(default_factory=list, sa_column=Column(JSON))


class Authority(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    level: str = Field(index=True)  # national | state | district
    district: str | None = Field(default=None, index=True)
    type: str = Field(index=True)  # emergency, police, cyber, legal_aid, ...
    phone: str | None = None
    url: str | None = None
    notes: str | None = None
    verified: bool = False
    last_verified: str | None = None


class LegalAid(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    kind: str  # legal_services_authority | ngo | advocate
    district: str | None = Field(default=None, index=True)
    specialisations: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    languages: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    phone: str | None = None
    email: str | None = None
    url: str | None = None
    free: bool = True
    verified: bool = False
    demo: bool = False  # sample data, label it in the UI


class CallbackRequest(SQLModel, table=True):
    """Minimal by design: no incident story is stored."""

    id: int | None = Field(default=None, primary_key=True)
    name: str
    phone: str
    district: str | None = None
    language: str | None = None
    legal_aid_id: int | None = Field(default=None, foreign_key="legalaid.id")
    consent: bool
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
