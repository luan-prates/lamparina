import os
import shutil
import threading

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.video import Video
from app.models.playlist import PlaylistVideo
from app.schemas.video import VideoCreate, VideoResponse, VideoTranscribe
from app.schemas.transcription import TranscriptionResponse
from app.tasks.pipeline import process_video
from app.config import settings

router = APIRouter(prefix="/videos", tags=["videos"])


@router.post("", response_model=VideoResponse, status_code=201)
def create_video(data: VideoCreate, db: Session = Depends(get_db)):
    video = Video(url=data.url)
    db.add(video)

    if data.playlist_id:
        count = (
            db.query(PlaylistVideo)
            .filter(PlaylistVideo.playlist_id == data.playlist_id)
            .count()
        )
        pv = PlaylistVideo(
            playlist_id=data.playlist_id,
            video_id=video.id,
            position=count,
        )
        db.add(pv)

    db.commit()
    db.refresh(video)

    threading.Thread(target=process_video, args=(video.id,), daemon=True).start()

    return video


@router.get("", response_model=list[VideoResponse])
def list_videos(
    status: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Video)
    if status:
        q = q.filter(Video.status == status)
    if search:
        q = q.filter(Video.title.ilike(f"%{search}%"))
    q = q.order_by(Video.created_at.desc())
    videos = q.offset((page - 1) * per_page).limit(per_page).all()
    return videos


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.delete("/{video_id}", status_code=204)
def delete_video(video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video_dir = os.path.join(settings.storage_path, "videos", video_id)
    if os.path.exists(video_dir):
        shutil.rmtree(video_dir)

    db.delete(video)
    db.commit()


@router.post("/{video_id}/retry", response_model=VideoResponse)
def retry_video(video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.status != "failed":
        raise HTTPException(status_code=400, detail="Video is not in failed state")

    if video.video_path:
        video.status = "downloaded"
    else:
        video.status = "pending"
    video.error_message = None
    db.commit()
    db.refresh(video)

    threading.Thread(target=process_video, args=(video.id,), daemon=True).start()

    return video


@router.post("/{video_id}/transcribe", response_model=VideoResponse)
def transcribe_video(video_id: str, data: VideoTranscribe, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if not video.audio_path:
        raise HTTPException(status_code=400, detail="Audio not extracted yet")

    video.status = "extracted"
    db.commit()
    db.refresh(video)

    threading.Thread(
        target=process_video,
        args=(video.id, data.engine, data.model_name),
        daemon=True,
    ).start()

    return video


@router.get("/{video_id}/transcription")
def get_transcription(video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if not video.transcription_path:
        raise HTTPException(status_code=404, detail="No transcription available")

    md_full_path = os.path.join(settings.storage_path, video.transcription_path)
    if not os.path.exists(md_full_path):
        raise HTTPException(status_code=404, detail="Transcription file not found")

    with open(md_full_path, "r", encoding="utf-8") as f:
        content = f.read()

    return {"markdown": content}


@router.get("/{video_id}/transcriptions", response_model=list[TranscriptionResponse])
def list_transcriptions(video_id: str, db: Session = Depends(get_db)):
    from app.models.transcription import Transcription

    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    transcriptions = (
        db.query(Transcription)
        .filter(Transcription.video_id == video_id)
        .order_by(Transcription.created_at.desc())
        .all()
    )
    return transcriptions
