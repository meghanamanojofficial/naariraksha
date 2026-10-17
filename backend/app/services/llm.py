"""Gemini wrapper (free key: https://aistudio.google.com/apikey).

ONE call per chat turn (saves free-tier quota):
  the model gets the conversation + intake + our compact legal library, and returns
  - what it understood (facts), which crimes apply, the 1-4 MOST relevant law codes,
  - a reply tailored to HER facts, specific next steps, targeted follow-up questions.
The server then validates every code against the database and builds the panels from DB rows.
If GEMINI_API_KEY is missing or the call fails, an offline fallback still gives crime-specific
steps and questions (from crimes.json), and the reason is returned so the UI can show it.
"""
import json
import os
import re
from datetime import date

MODEL = os.getenv("GEMINI_MODEL") or "gemini-3.8-flash"
LAST_ERROR: str | None = None  # shown on /health and in chat responses to debug the AI connection

EMERGENCY_RE = re.compile(r"\b(kill|right now|outside my (door|house|room)|attacking|bleeding|help me now|suicid|end my life)", re.I)

ANALYZE_SYSTEM = """You are NariRaksha, a calm, warm, knowledgeable first-step legal guide for women in India
(focus: Kerala). You are not a lawyer. Your job is to UNDERSTAND her specific situation and give
NARROWED-DOWN, SPECIFIC guidance, like a good legal-aid volunteer would.

HOW TO RESPOND
1. Read the whole conversation. Build on earlier turns; never repeat advice you already gave.
2. Work out the facts: what happened, who did it (relationship), when, where/which platform,
   whether it is ongoing, injuries, what evidence she has, what she wants (safety, FIR, takedown, divorce, etc).
3. If her message is vague (e.g. "I was harassed"), do NOT dump everything. Acknowledge her, give the
   1-2 things that matter immediately (safety / medical / don't delete evidence), and ask the 2 most
   important specific questions. Still make your best tentative classification.
4. Once you know enough, be specific to HER facts:
   - name the likely offence(s) in plain words and cite the 1-3 MOST relevant sections by their
     "citation" text from the library (the incident date decides old vs new code; the library already
     resolved this),
   - give concrete steps in the right order for her case (e.g. Instagram -> report the profile + 1930;
     husband -> Protection Officer for a protection order AND/OR police under BNS 85;
     college/office -> Internal Committee within 3 months; under 18 -> POCSO + 1098),
   - say which authority to approach first and why, using only authorities in the library,
   - mention time limits or urgent items if relevant (CCTV gets deleted, medical exam, 24-hour takedown).
5. Tone: believe her, never blame, short paragraphs, simple words, no legal jargon without explanation.
   Use "you". 120-220 words in "reply". No markdown headings; you may use "•" bullets.
6. Safety first: if she may be in immediate danger or at risk of self-harm, set is_emergency=true and
   start the reply by telling her to call 112.
7. NEVER invent laws, section numbers, phone numbers, websites or organisations. Use only LIBRARY.
8. Reply in {language}.

INTAKE (from a form she filled, may be empty): {intake}
TODAY: {today}

LIBRARY
Crimes (slug: name):
{crimes}
Laws (code | citation | title):
{laws}
Authorities (type: name, contact):
{authorities}

Return ONLY JSON:
{{
 "facts": {{"what": str|null, "who": str|null, "when": str|null, "where": str|null, "ongoing": bool|null,
            "evidence_she_has": str|null, "what_she_wants": str|null}},
 "crime_slugs": [str],          // 0-3 from the Crimes list, most relevant first
 "key_law_codes": [str],        // 1-4 codes from the Laws list that matter MOST for her facts
 "recommended_authority": "police"|"magistrate"|"protection_officer"|"posh_committee"|"cyber"|null,
 "is_emergency": bool,
 "reply": str,
 "next_steps": [str],           // 3-5 steps specific to her situation, in order
 "follow_up_questions": [str]   // 0-2 short questions whose answers would change the advice
}}"""

COMPLAINT_SYSTEM = """Draft a formal complaint in {language} for a woman in India to submit to: {authority}.
Use ONLY the facts provided. Where information is missing write [PLACEHOLDER IN CAPS].
Cite only these provisions where relevant: {citations}.
Format (plain text, no markdown):
To, / Subject: / Respected Sir/Madam, / numbered chronological facts / evidence enclosed (list) /
specific request ({request}) / Date, Place, Name, Signature, Contact.
Formal, factual, concise. Do not exaggerate or add facts."""


def _client():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return None
    from google import genai

    return genai.Client(api_key=key)


def offline_reason() -> str:
    if not os.getenv("GEMINI_API_KEY"):
        return "GEMINI_API_KEY is not set in backend/.env"
    return LAST_ERROR or "AI call failed"


def _call(system: str, user: str, json_mode: bool = True) -> str | None:
    global LAST_ERROR
    client = _client()
    if client is None:
        return None
    from google.genai import types

    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=user,
            config=types.GenerateContentConfig(
                system_instruction=system,
                temperature=0.3,
                response_mime_type="application/json" if json_mode else "text/plain",
            ),
        )
        LAST_ERROR = None
        return resp.text
    except Exception as e:  # bad key, quota (429), network, wrong model name...
        LAST_ERROR = f"{type(e).__name__}: {e}"[:300]
        print(f"[llm] fallback: {LAST_ERROR}")
        return None


def _json(raw: str | None) -> dict | None:
    if not raw:
        return None
    try:
        out = json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", raw, re.S)
        try:
            out = json.loads(m.group(0)) if m else None
        except json.JSONDecodeError:
            out = None
    return out if isinstance(out, dict) else None


def transcript(messages: list[dict]) -> str:
    return "\n".join(f"{'HER' if m['role'] == 'user' else 'NARIRAKSHA'}: {m['content']}" for m in messages[-12:])


# ---------- chat: one call ----------
def analyze(messages: list[dict], intake: dict, language: str, crimes: list, laws: list[dict], authorities: list) -> dict | None:
    """Returns the model's JSON, or None if the AI is unavailable."""
    system = ANALYZE_SYSTEM.format(
        language=language,
        intake=json.dumps({k: v for k, v in intake.items() if v not in (None, False, "")}, ensure_ascii=False) or "{}",
        today=date.today().isoformat(),
        crimes="\n".join(f"- {c.slug}: {c.name}" for c in crimes),
        laws="\n".join(f"- {l['code']} | {l['citation']} | {l['title']}" for l in laws),
        authorities="\n".join(f"- {a.type}: {a.name}, {a.phone or a.url or 'contact in app'}" for a in authorities),
    )
    data = _json(_call(system, transcript(messages)))
    if not data or not data.get("reply"):
        return None
    if EMERGENCY_RE.search(transcript(messages)):
        data["is_emergency"] = True
    return data


# ---------- offline fallback (still specific, from crimes.json) ----------
def offline_classify(messages: list[dict], crimes: list) -> list[str]:
    low = " ".join(m["content"] for m in messages if m["role"] == "user").lower()
    scored = [(sum(bool(re.search(r"\b" + re.escape(k), low)) for k in c.keywords), c.slug) for c in crimes]
    return [s for n, s in sorted(scored, reverse=True) if n > 0][:3]


def offline_reply(messages: list[dict], crimes: list, key_laws: list[dict], is_emergency: bool, intake: dict) -> dict:
    turns = sum(1 for m in messages if m["role"] == "assistant")
    parts = ["If you are in danger right now, please call 112."] if is_emergency else []
    if not crimes:
        parts.append("I'm here with you, and you are not at fault. To guide you properly, could you tell me: "
                     "what happened, who did it (a stranger, partner, family, colleague, someone online), "
                     "when it happened, and whether you are safe right now?")
        return {"reply": "\n\n".join(parts), "next_steps": [], "follow_up_questions": []}
    top = crimes[0]
    law = f", covered under {key_laws[0]['citation']}" if key_laws else ""
    if turns == 0:
        parts.append(f"I'm sorry this happened. You are not at fault. From what you've shared, this may be {top.name.lower()}{law}.")
        if intake.get("district"):
            parts.append(f"I've listed the offices in {intake['district']} that can help, below.")
    else:
        parts.append(f"Thank you for telling me more. Based on this, the closest match is {top.name.lower()}{law}. "
                     "I've updated the steps and the laws below.")
    asked = turns * 2
    questions = (top.questions or [])[asked:asked + 2]
    if questions:
        parts.append("To narrow this down: " + " ".join(questions))
    return {"reply": "\n\n".join(parts), "next_steps": top.first_steps, "follow_up_questions": questions}


# ---------- complaint ----------
AUTHORITIES = {
    "police": ("The Station House Officer, [POLICE STATION NAME]", "register an FIR and take action"),
    "magistrate": ("The Judicial First Class Magistrate, [COURT NAME]", "direct the police to register an FIR and investigate under BNSS Section 175(3)"),
    "protection_officer": ("The Protection Officer, [DISTRICT], under the Protection of Women from Domestic Violence Act, 2005", "record a Domestic Incident Report and help me seek protection orders"),
    "posh_committee": ("The Presiding Officer, Internal Committee, [ORGANISATION NAME]", "inquire into this complaint under the POSH Act, 2013"),
    "cyber": ("The Cyber Crime Police Station / cybercrime.gov.in", "register a case, identify the offender and have the content removed"),
}


def draft_complaint(facts: dict, citations: list[str], authority_type: str, language: str) -> str:
    authority, request = AUTHORITIES.get(authority_type, AUTHORITIES["police"])
    user = json.dumps(facts, ensure_ascii=False)
    out = _call(COMPLAINT_SYSTEM.format(language=language, authority=authority, citations="; ".join(citations) or "none", request=request), user, json_mode=False)
    if out:
        return out.strip()
    g = lambda k, d: facts.get(k) or d  # noqa: E731
    return (
        f"To,\n{authority}\n\n"
        f"Subject: Complaint regarding {g('incident_type', '[NATURE OF INCIDENT]')}\n\n"
        "Respected Sir/Madam,\n\n"
        f"I, {g('name', '[YOUR NAME]')}, residing at {g('address', '[YOUR ADDRESS]')}, submit the following complaint.\n\n"
        f"1. On {g('incident_date', '[DATE]')} at {g('incident_place', '[PLACE]')}, the following occurred:\n{g('description', '[DESCRIBE WHAT HAPPENED]')}\n\n"
        f"2. The person(s) responsible: {g('accused', '[NAME / DESCRIPTION OF ACCUSED, IF KNOWN]')}\n\n"
        f"3. Witnesses: {g('witnesses', '[NAMES, IF ANY]')}\n\n"
        f"Relevant provisions (for reference): {'; '.join(citations) or '[TO BE ADDED]'}\n\n"
        f"Evidence enclosed: {g('evidence', '[LIST OF SCREENSHOTS, MEDICAL REPORTS, ETC.]')}\n\n"
        f"I request you to kindly {request}.\n\n"
        "Date: [DATE]\nPlace: [PLACE]\n\nYours faithfully,\n[NAME]\n[SIGNATURE]\n[PHONE / EMAIL]"
    )
