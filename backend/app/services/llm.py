"""Gemini wrapper (free key: https://aistudio.google.com/apikey).

Two steps per chat turn:
  1. classify  -> which crime slugs from OUR database apply (+ emergency flag)
  2. answer    -> plain-language reply that may only use the rows we looked up
If GEMINI_API_KEY is missing or a call fails, an offline keyword fallback keeps the demo alive.
"""
import json
import os
import re

MODEL = os.getenv("GEMINI_MODEL") or "gemini-2.5-flash"
LAST_ERROR: str | None = None  # shown on /health to debug the AI connection

EMERGENCY_RE = re.compile(r"\b(kill|right now|outside my (door|house|room)|attacking|bleeding|help me now|suicid|end my life)\b", re.I)

CLASSIFY_SYSTEM = """You classify a woman's description of an incident in India into categories.
Choose ONLY from these slugs (0-3 most relevant, most relevant first):
{index}
Return JSON: {{"crime_slugs": [string], "is_emergency": boolean, "missing_info": [string]}}
is_emergency = she may be in immediate physical danger or at risk of self-harm.
missing_info = up to 2 short facts that would change the guidance (e.g. "when it happened")."""

ANSWER_SYSTEM = """You are NariRaksha, a calm, warm first-step legal guide for women in India. You are not a lawyer.
Rules:
- Use ONLY the laws, authorities and checklists in CONTEXT. Never invent section numbers, phone numbers or links.
- Simple words, short paragraphs, no blame. Believe her.
- Safety first. If is_emergency, start by telling her to call 112.
- Explain what the situation may legally be, her key rights, and the next 3-5 concrete steps.
- Refer to laws by the "citation" field. Do not list every law; the app shows them separately.
- End with one gentle follow-up question only if important facts are missing.
- Reply in {language}.
Return JSON: {{"reply": string, "next_steps": [string]}}

CONTEXT:
{context}"""

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
                temperature=0.2,
                response_mime_type="application/json" if json_mode else "text/plain",
            ),
        )
        LAST_ERROR = None
        return resp.text
    except Exception as e:  # bad key, quota, network, wrong model name...
        LAST_ERROR = f"{type(e).__name__}: {e}"[:300]
        print(f"[llm] fallback: {LAST_ERROR}")
        return None


def _json(raw: str | None) -> dict | None:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", raw, re.S)
        return json.loads(m.group(0)) if m else None


def transcript(messages: list[dict]) -> str:
    return "\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages[-10:])


# ---------- step 1 ----------
def classify(messages: list[dict], crimes: list) -> dict:
    index = "\n".join(f"- {c.slug}: {c.name}" for c in crimes)
    text = transcript(messages)
    data = _json(_call(CLASSIFY_SYSTEM.format(index=index), text))
    valid = {c.slug for c in crimes}
    if data:
        data["crime_slugs"] = [s for s in data.get("crime_slugs", []) if s in valid][:3]
        data["offline"] = False
    else:  # offline keyword fallback
        low = " ".join(m["content"] for m in messages if m["role"] == "user").lower()
        scored = [(sum(bool(re.search(r"\b" + re.escape(k), low)) for k in c.keywords), c.slug) for c in crimes]
        data = {
            "crime_slugs": [s for n, s in sorted(scored, reverse=True) if n > 0][:3],
            "is_emergency": False,
            "missing_info": [],
            "offline": True,
        }
    if EMERGENCY_RE.search(text):
        data["is_emergency"] = True
    return data


# ---------- step 2 ----------
def answer(messages: list[dict], context: dict, language: str) -> dict:
    data = _json(_call(ANSWER_SYSTEM.format(language=language, context=json.dumps(context, ensure_ascii=False)), transcript(messages)))
    if data and data.get("reply"):
        return data
    crimes = context.get("crimes", [])
    names = ", ".join(c["name"] for c in crimes) or "an offence"
    reply = ("If you are in danger right now, call 112.\n\n" if context.get("is_emergency") else "")
    reply += (
        f"I'm sorry this happened. You are not at fault. What you describe may involve: {names}. "
        "Below are the laws that may apply, what evidence to keep, and who can help. "
        "You can report at any police station (Zero FIR), and every woman can get a free lawyer."
        if crimes else
        "I'm here to help. Could you tell me a little more about what happened, when, and whether you are safe right now?"
    )
    return {"reply": reply, "next_steps": [], "offline": True}


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
