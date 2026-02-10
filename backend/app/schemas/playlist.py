from datetime import datetime

from pydantic import BaseModel

from app.schemas.video import VideoResponse


class PlaylistCreate(BaseModel):
    name: str
    description: str | None = None


class PlaylistUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class PlaylistVideoAdd(BaseModel):
    video_id: str


class PlaylistReorder(BaseModel):
    video_ids: list[str]


class PlaylistResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    video_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PlaylistDetailResponse(PlaylistResponse):
    videos: list[VideoResponse] = []
