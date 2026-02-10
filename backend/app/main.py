import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func

from app.database import Base, engine, get_db
from app.models import Video, Playlist, Transcription, PlatformCredential  # noqa: F401
from app.routers import videos, playlists, transcriptions, settings
from app.routers import credentials
from app.config import settings as app_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(os.path.join(app_settings.storage_path, "db"), exist_ok=True)
    os.makedirs(os.path.join(app_settings.storage_path, "videos"), exist_ok=True)
    os.makedirs(os.path.join(app_settings.storage_path, "cookies"), exist_ok=True)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Video Study System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(videos.router, prefix="/api/v1")
app.include_router(playlists.router, prefix="/api/v1")
app.include_router(transcriptions.router, prefix="/api/v1")
app.include_router(settings.router, prefix="/api/v1")
app.include_router(credentials.router, prefix="/api/v1")


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}


@app.get("/api/v1/stats")
def stats():
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        total_videos = db.query(Video).count()
        completed = db.query(Video).filter(Video.status == "completed").count()
        processing = (
            db.query(Video)
            .filter(Video.status.notin_(["completed", "failed", "pending"]))
            .count()
        )
        failed = db.query(Video).filter(Video.status == "failed").count()
        total_playlists = db.query(Playlist).count()
        total_transcriptions = db.query(Transcription).count()

        recent_videos = (
            db.query(Video)
            .order_by(Video.created_at.desc())
            .limit(5)
            .all()
        )

        from app.schemas.video import VideoResponse

        return {
            "total_videos": total_videos,
            "completed": completed,
            "processing": processing,
            "failed": failed,
            "total_playlists": total_playlists,
            "total_transcriptions": total_transcriptions,
            "recent_videos": [VideoResponse.model_validate(v) for v in recent_videos],
        }
    finally:
        db.close()
