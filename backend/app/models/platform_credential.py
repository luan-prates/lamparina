import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime

from app.database import Base


class PlatformCredential(Base):
    __tablename__ = "platform_credentials"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    platform_name = Column(String, nullable=False)
    platform_url = Column(String, nullable=False)
    auth_type = Column(String, nullable=False)  # "cookies" or "login"
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    cookies_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
