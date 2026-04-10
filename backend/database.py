import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "leads.db"


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT    NOT NULL,
                last_name  TEXT    NOT NULL,
                email      TEXT    NOT NULL,
                phone      TEXT    NOT NULL,
                service    TEXT    NOT NULL DEFAULT '',
                details    TEXT    NOT NULL DEFAULT '',
                created_at TEXT    NOT NULL
            )
        """)


def save_lead(
    first_name: str,
    last_name: str,
    email: str,
    phone: str,
    service: str,
    details: str,
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO leads
                (first_name, last_name, email, phone, service, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (first_name, last_name, email, phone, service, details, now),
        )
