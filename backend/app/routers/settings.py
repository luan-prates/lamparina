from fastapi import APIRouter
from pydantic import BaseModel

from app.config import settings

router = APIRouter(tags=["settings"])


class SettingsResponse(BaseModel):
    whisper_engine: str
    whisper_model: str
    openai_api_key_set: bool


class SettingsUpdate(BaseModel):
    whisper_engine: str | None = None
    whisper_model: str | None = None
    openai_api_key: str | None = None


@router.get("/settings", response_model=SettingsResponse)
def get_settings():
    return SettingsResponse(
        whisper_engine=settings.whisper_engine,
        whisper_model=settings.whisper_model,
        openai_api_key_set=bool(settings.openai_api_key),
    )


@router.put("/settings", response_model=SettingsResponse)
def update_settings(data: SettingsUpdate):
    if data.whisper_engine is not None:
        settings.whisper_engine = data.whisper_engine
    if data.whisper_model is not None:
        settings.whisper_model = data.whisper_model
    if data.openai_api_key is not None:
        settings.openai_api_key = data.openai_api_key

    return SettingsResponse(
        whisper_engine=settings.whisper_engine,
        whisper_model=settings.whisper_model,
        openai_api_key_set=bool(settings.openai_api_key),
    )
