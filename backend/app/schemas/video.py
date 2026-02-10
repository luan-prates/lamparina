from datetime import datetime

from pydantic import BaseModel


class VideoCreate(BaseModel):
    url: str
    playlist_id: str | None = None


class VideoResponse(BaseModel):
    id: str
    url: str
    title: str | None = None
    description: str | None = None
    duration_seconds: int | None = None
    thumbnail_url: str | None = None
    channel_name: str | None = None
    status: str
    error_message: str | None = None
    video_path: str | None = None
    audio_path: str | None = None
    transcription_path: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VideoTranscribe(BaseModel):
    engine: str | None = None
    model_name: str | None = None
