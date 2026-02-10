import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    video_associations = relationship(
        "PlaylistVideo", back_populates="playlist", cascade="all, delete-orphan"
    )


class PlaylistVideo(Base):
    __tablename__ = "playlist_videos"

    playlist_id = Column(
        String(36), ForeignKey("playlists.id", ondelete="CASCADE"), primary_key=True
    )
    video_id = Column(
        String(36), ForeignKey("videos.id", ondelete="CASCADE"), primary_key=True
    )
    position = Column(Integer, nullable=False, default=0)
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    playlist = relationship("Playlist", back_populates="video_associations")
    video = relationship("Video", back_populates="playlist_associations")
