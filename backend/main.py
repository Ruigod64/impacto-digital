import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator
from database import init_db, save_lead

app = FastAPI()

# ---------------------------------------------------------------------------
# CORS — restrict to your Netlify domain in production.
# Set the ALLOWED_ORIGIN environment variable when you deploy, e.g.:
#   ALLOWED_ORIGIN=https://tu-sitio.netlify.app
# ---------------------------------------------------------------------------
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

class LeadIn(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    service: str = ""
    details: str = ""

    @field_validator("first_name", "last_name", "phone")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El campo no puede estar vacío.")
        return v.strip()

    @field_validator("email")
    @classmethod
    def strip_email(cls, v: str) -> str:
        return v.strip().lower()


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@app.post("/leads", status_code=201)
def create_lead(lead: LeadIn) -> dict:
    try:
        save_lead(
            first_name=lead.first_name,
            last_name=lead.last_name,
            email=lead.email,
            phone=lead.phone,
            service=lead.service,
            details=lead.details,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Error al guardar el lead.") from exc

    return {"ok": True}
