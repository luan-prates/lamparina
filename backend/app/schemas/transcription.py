from datetime import datetime

from pydantic import BaseModel


class TranscriptionResponse(BaseModel):
    id: str
    video_id: str
    engine: str
    model_name: str | None = None
    language: str | None = None
    raw_text: str | None = None
    markdown_path: str | None = None
    duration_seconds: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
