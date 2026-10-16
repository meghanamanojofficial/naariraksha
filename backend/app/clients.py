"""Institutional clients (Campus / Partner / Workplace): register, login, profile.

Kept completely separate from the victim-facing side: no client can ever see who used the
platform or what they wrote. Passwords are hashed (PBKDF2-SHA256); tokens are HMAC-signed.
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Session, select

from .db import get_session
from .models import Organization

router = APIRouter(prefix="/api/clients", tags=["clients"])

PRODUCTS = {
    "campus": {"name": "NariRaksha Campus", "for": "Colleges, universities and educational institutions"},
    "partner": {"name": "NariRaksha Partner", "for": "NGOs and community organisations"},
    "workplace": {"name": "NariRaksha Workplace", "for": "Employers and corporate partners"},
}
SECRET = (os.getenv("SECRET_KEY") or "dev-only-change-me").encode()
TOKEN_TTL = 60 * 60 * 24 * 7  # 7 days


# ---------- helpers ----------
def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    salt, _ = stored.split("$", 1)
    return hmac.compare_digest(hash_password(password, salt), stored)


def make_token(org_id: int) -> str:
    payload = base64.urlsafe_b64encode(json.dumps({"id": org_id, "exp": int(time.time()) + TOKEN_TTL}).encode()).decode()
    sig = hmac.new(SECRET, payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


def read_token(token: str) -> int:
    try:
        payload, sig = token.split(".", 1)
        if not hmac.compare_digest(sig, hmac.new(SECRET, payload.encode(), hashlib.sha256).hexdigest()):
            raise ValueError
        data = json.loads(base64.urlsafe_b64decode(payload))
        if data["exp"] < time.time():
            raise ValueError
        return int(data["id"])
    except Exception:
        raise HTTPException(401, "Session expired. Please log in again.")


def current_org(authorization: str | None = Header(default=None), s: Session = Depends(get_session)) -> Organization:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Please log in.")
    org = s.get(Organization, read_token(authorization[7:]))
    if not org:
        raise HTTPException(401, "Account not found.")
    return org


def public(org: Organization) -> dict:
    return {
        **org.model_dump(exclude={"password_hash"}),
        "product_name": PRODUCTS[org.product]["name"],
    }


# ---------- routes ----------
@router.get("/products")
def products():
    return PRODUCTS


class RegisterIn(BaseModel):
    product: str = Field(pattern="^(campus|partner|workplace)$")
    org_name: str = Field(min_length=2, max_length=200)
    contact_name: str = Field(min_length=2, max_length=100)
    designation: str | None = Field(default=None, max_length=100)
    email: EmailStr
    phone: str = Field(pattern=r"^[0-9+\- ]{7,15}$")
    district: str | None = None
    size: str | None = None  # students / beneficiaries / employees band
    has_internal_committee: bool | None = None
    message: str | None = Field(default=None, max_length=1000)
    password: str = Field(min_length=8, max_length=128)


@router.post("/register")
def register(body: RegisterIn, s: Session = Depends(get_session)):
    email = body.email.lower()
    if s.exec(select(Organization).where(Organization.email == email)).first():
        raise HTTPException(409, "An account with this email already exists. Please log in.")
    org = Organization(**body.model_dump(exclude={"password", "email"}), email=email, password_hash=hash_password(body.password))
    s.add(org)
    s.commit()
    s.refresh(org)
    return {"token": make_token(org.id), "org": public(org)}


class LoginIn(BaseModel):
    product: str = Field(pattern="^(campus|partner|workplace)$")
    email: EmailStr
    password: str


@router.post("/login")
def login(body: LoginIn, s: Session = Depends(get_session)):
    org = s.exec(select(Organization).where(Organization.email == body.email.lower())).first()
    if not org or not verify_password(body.password, org.password_hash):
        raise HTTPException(401, "Incorrect email or password.")
    if org.product != body.product:
        raise HTTPException(403, f"This account is registered for {PRODUCTS[org.product]['name']}. Please choose that option.")
    org.last_login = datetime.now(timezone.utc)
    s.add(org)
    s.commit()
    return {"token": make_token(org.id), "org": public(org)}


@router.get("/me")
def me(org: Organization = Depends(current_org)):
    return public(org)
