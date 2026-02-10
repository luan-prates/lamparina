import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    channel_name = Column(String, nullable=True)
    status = Column(String, nullable=False, default="pending")
    error_message = Column(String, nullable=True)
    video_path = Column(String, nullable=True)
    audio_path = Column(String, nullable=True)
    transcription_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    transcriptions = relationship(
        "Transcription", back_populates="video", cascade="all, delete-orphan"
    )
    playlist_associations = relationship(
        "PlaylistVideo", back_populates="video", cascade="all, delete-orphan"
    )
