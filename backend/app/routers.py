"""All API routes."""
import io
from datetime import date

from docx import Document
from docx.shared import Pt
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from .db import get_session
from .models import Authority, CallbackRequest, Crime, LegalAid
from .services import legal, llm

router = APIRouter(prefix="/api")

KERALA_DISTRICTS = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam",
    "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
]


# ---------- reference data ----------
@router.get("/meta")
def meta():
    return {"districts": KERALA_DISTRICTS, "new_laws_from": legal.NEW_LAWS_FROM.isoformat()}


@router.get("/crimes")
def list_crimes(s: Session = Depends(get_session)):
    return [{"slug": c.slug, "name": c.name, "category": c.category, "summary": c.summary} for c in s.exec(select(Crime)).all()]


@router.get("/crimes/{slug}")
def get_crime(slug: str, incident_date: date | None = None, district: str | None = None, s: Session = Depends(get_session)):
    crime = s.exec(select(Crime).where(Crime.slug == slug)).first()
    if not crime:
        raise HTTPException(404, "Crime not found")
    return {
        **crime.model_dump(exclude={"keywords"}),
        "laws": legal.laws_for_crimes(s, [crime], incident_date),
        "authorities": legal.authorities_for(s, crime.authority_types, district),
    }


@router.get("/authorities")
def list_authorities(level: str | None = None, district: str | None = None, type: str | None = None, s: Session = Depends(get_session)):
    q = select(Authority)
    if level:
        q = q.where(Authority.level == level)
    if district:
        q = q.where(Authority.district == district)
    if type:
        q = q.where(Authority.type == type)
    return s.exec(q).all()


@router.get("/legal-aid")
def list_legal_aid(district: str | None = None, include_demo: bool = Query(True), s: Session = Depends(get_session)):
    q = select(LegalAid)
    if district:
        q = q.where((LegalAid.district == district) | (LegalAid.district == None))  # noqa: E711
    if not include_demo:
        q = q.where(LegalAid.demo == False)  # noqa: E712
    return s.exec(q).all()


# ---------- chat ----------
class Msg(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(max_length=4000)


class Intake(BaseModel):
    incident_date: date | None = None
    district: str | None = None
    is_minor: bool = False
    in_danger: bool = False
    relation_to_accused: str | None = None  # stranger, partner, family, colleague, online


class ChatIn(BaseModel):
    messages: list[Msg] = Field(min_length=1, max_length=30)
    intake: Intake = Intake()
    language: str = "English"


@router.post("/chat")
def chat(body: ChatIn, s: Session = Depends(get_session)):
    msgs = [m.model_dump() for m in body.messages]
    all_crimes = s.exec(select(Crime)).all()

    cls = llm.classify(msgs, all_crimes)
    slugs = cls["crime_slugs"]
    sexual = {"rape", "sexual-harassment", "voyeurism", "sextortion"}
    if body.intake.is_minor and (sexual & set(slugs)) and "child-sexual-abuse" not in slugs:
        slugs.insert(0, "child-sexual-abuse")
    is_emergency = cls.get("is_emergency") or body.intake.in_danger

    crimes = legal.crimes_by_slugs(s, slugs)
    laws = legal.laws_for_crimes(s, crimes, body.intake.incident_date)
    types = ["emergency"] if is_emergency else []
    for c in crimes:
        types += [t for t in c.authority_types if t not in types]
    authorities = legal.authorities_for(s, types or ["emergency", "women_helpline", "police"], body.intake.district)
    aid = legal.legal_aid_for(s, body.intake.district)

    context = {
        "is_emergency": is_emergency,
        "intake": body.intake.model_dump(mode="json"),
        "crimes": [{"name": c.name, "summary": c.summary} for c in crimes],
        "laws": [{"citation": l["citation"], "title": l["title"], "plain": l["plain_en"]} for l in laws],
        "authorities": [{"name": a.name, "phone": a.phone, "url": a.url} for a in authorities],
        "missing_info": cls.get("missing_info", []),
    }
    ans = llm.answer(msgs, context, body.language)

    return {
        "reply": ans["reply"],
        "next_steps": ans.get("next_steps", []),
        "is_emergency": is_emergency,
        "offline": cls.get("offline", False) or ans.get("offline", False),
        "crimes": [{"slug": c.slug, "name": c.name, "category": c.category} for c in crimes],
        "laws": laws,
        "evidence": list(dict.fromkeys(e for c in crimes for e in c.evidence)),
        "documents": list(dict.fromkeys(d for c in crimes for d in c.documents)),
        "authorities": authorities,
        "legal_aid": aid,
    }


# ---------- complaint ----------
class ComplaintIn(BaseModel):
    crime_slug: str | None = None
    authority_type: str = "police"  # police | magistrate | protection_officer | posh_committee | cyber
    language: str = "English"
    name: str | None = None
    address: str | None = None
    incident_date: date | None = None
    incident_place: str | None = None
    description: str = Field(min_length=10, max_length=8000)
    accused: str | None = None
    witnesses: str | None = None
    evidence: str | None = None


@router.post("/complaint")
def complaint(body: ComplaintIn, s: Session = Depends(get_session)):
    crimes = legal.crimes_by_slugs(s, [body.crime_slug] if body.crime_slug else [])
    laws = legal.laws_for_crimes(s, crimes, body.incident_date)
    citations = [l["citation"] for l in laws if l["cognizable"] is not None or l["code"].startswith(("PWDVA", "POSH"))]
    facts = body.model_dump(mode="json", exclude={"authority_type", "language", "crime_slug"})
    facts["incident_type"] = crimes[0].name if crimes else None
    return {"text": llm.draft_complaint(facts, citations, body.authority_type, body.language), "citations": citations}


class DocxIn(BaseModel):
    text: str = Field(min_length=10, max_length=20000)
    filename: str = "complaint"


@router.post("/complaint/docx")
def complaint_docx(body: DocxIn):
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(12)
    for para in body.text.split("\n"):
        doc.add_paragraph(para)
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    safe = "".join(ch for ch in body.filename if ch.isalnum() or ch in "-_") or "complaint"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{safe}.docx"'},
    )


# ---------- lawyer callback ----------
class CallbackIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(pattern=r"^[0-9+\- ]{7,15}$")
    district: str | None = None
    language: str | None = None
    legal_aid_id: int | None = None
    consent: bool


@router.post("/callback")
def callback(body: CallbackIn, s: Session = Depends(get_session)):
    if not body.consent:
        raise HTTPException(400, "Consent is required to share your contact details.")
    req = CallbackRequest(**body.model_dump())
    s.add(req)
    s.commit()
    return {"ok": True, "id": req.id}
