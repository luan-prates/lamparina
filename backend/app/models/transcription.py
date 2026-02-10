import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Transcription(Base):
    __tablename__ = "transcriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    video_id = Column(
        String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False
    )
    engine = Column(String, nullable=False)
    model_name = Column(String, nullable=True)
    language = Column(String, nullable=True)
    raw_text = Column(String, nullable=True)
    markdown_path = Column(String, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    video = relationship("Video", back_populates="transcriptions")
