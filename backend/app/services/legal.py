"""Deterministic lookups. Every legal citation shown to users comes from here, never from the LLM."""
from datetime import date

from sqlmodel import Session, or_, select

from ..models import Authority, Crime, CrimeLaw, LegalAid, Law

NEW_LAWS_FROM = date(2024, 7, 1)  # BNS / BNSS / BSA replaced IPC / CrPC / Evidence Act


def law_view(law: Law, incident_date: date | None) -> dict:
    """Pick which code applies. Old codes apply only to incidents before 1 July 2024."""
    use_old = bool(law.old_act and incident_date and incident_date < NEW_LAWS_FROM)
    d = law.model_dump()
    d["applies"] = "old" if use_old else "new"
    d["citation"] = f"{law.old_act}, Section {law.old_section}" if use_old else f"{law.act}, Section {law.section}"
    d["also_known_as"] = (
        f"{law.act}, Section {law.section}" if use_old
        else (f"formerly {law.old_act}, Section {law.old_section}" if law.old_act else None)
    )
    return d


def crimes_by_slugs(s: Session, slugs: list[str]) -> list[Crime]:
    if not slugs:
        return []
    found = s.exec(select(Crime).where(Crime.slug.in_(slugs))).all()
    order = {slug: i for i, slug in enumerate(slugs)}
    return sorted(found, key=lambda c: order.get(c.slug, 99))


def laws_for_crimes(s: Session, crimes: list[Crime], incident_date: date | None) -> list[dict]:
    ids = [c.id for c in crimes]
    if not ids:
        return []
    rows = s.exec(select(Law).join(CrimeLaw).where(CrimeLaw.crime_id.in_(ids))).all()
    seen, out = set(), []
    for law in rows:
        if law.code not in seen:
            seen.add(law.code)
            out.append(law_view(law, incident_date))
    return out


def authorities_for(s: Session, types: list[str], district: str | None) -> list[Authority]:
    q = select(Authority).where(Authority.type.in_(types))
    q = q.where(or_(Authority.level != "district", Authority.district == district)) if district else q.where(Authority.level != "district")
    rank = {"district": 0, "state": 1, "national": 2}
    return sorted(s.exec(q).all(), key=lambda a: (types.index(a.type) if a.type in types else 99, rank.get(a.level, 3)))


def legal_aid_for(s: Session, district: str | None) -> list[LegalAid]:
    q = select(LegalAid).where(LegalAid.demo == False)  # noqa: E712
    q = q.where(or_(LegalAid.district == None, LegalAid.district == district)) if district else q.where(LegalAid.district == None)  # noqa: E711
    return list(s.exec(q).all())
