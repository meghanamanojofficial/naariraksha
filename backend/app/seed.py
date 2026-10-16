"""Load app/seed_data/*.json into the database.

    python -m app.seed          # load only if the DB is empty
    python -m app.seed --reset  # wipe content tables and reload (keeps callback requests)
"""
import json
import sys
from pathlib import Path

from sqlmodel import Session, delete, select

from .db import engine, init_db
from .models import Authority, Crime, CrimeLaw, LegalAid, Law

DATA = Path(__file__).parent / "seed_data"


def _load(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def seed(reset: bool = False) -> None:
    init_db()
    with Session(engine) as s:
        if not reset and s.exec(select(Crime)).first():
            return
        for model in (CrimeLaw, Crime, Law, Authority, LegalAid):
            s.exec(delete(model))
        s.commit()

        laws = {}
        for row in _load("laws.json"):
            law = Law(**row)
            s.add(law)
            laws[law.code] = law
        s.flush()

        for row in _load("crimes.json"):
            codes = row.pop("law_codes")
            crime = Crime(**row)
            s.add(crime)
            s.flush()
            for code in codes:
                if code not in laws:
                    raise ValueError(f"crimes.json: '{row['slug']}' references unknown law code '{code}'")
                s.add(CrimeLaw(crime_id=crime.id, law_id=laws[code].id))

        for row in _load("authorities.json"):
            s.add(Authority(**row))
        for row in _load("legal_aid.json"):
            s.add(LegalAid(**row))
        s.commit()
        print(f"Seeded {len(laws)} laws, {len(_load('crimes.json'))} crimes.")


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
