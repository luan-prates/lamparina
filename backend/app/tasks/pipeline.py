import uuid
import traceback

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.video import Video
from app.models.transcription import Transcription
from app.services.downloader import download_video
from app.services.audio_extractor import extract_audio
from app.services.transcriber import transcribe_audio
from app.services.markdown_writer import write_markdown


def process_video(video_id: str, engine: str | None = None, model_name: str | None = None):
    db = SessionLocal()
    try:
        _run_pipeline(db, video_id, engine, model_name)
    except Exception as e:
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            video.status = "failed"
            video.error_message = f"{type(e).__name__}: {e}\n{traceback.format_exc()}"
            db.commit()
    finally:
        db.close()


def _run_pipeline(db: Session, video_id: str, engine: str | None, model_name: str | None):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return

    # Step 1: Download
    if video.status in ("pending", "failed"):
        video.status = "downloading"
        video.error_message = None
        db.commit()

        info = download_video(video_id, video.url, db)
        video.title = info["title"]
        video.description = info["description"]
        video.duration_seconds = info["duration_seconds"]
        video.thumbnail_url = info["thumbnail_url"]
        video.channel_name = info["channel_name"]
        video.video_path = info["video_path"]
        video.status = "downloaded"
        db.commit()

    # Step 2: Extract audio
    if video.status == "downloaded":
        video.status = "extracting"
        db.commit()

        audio_path = extract_audio(video_id, video.video_path)
        video.audio_path = audio_path
        video.status = "extracted"
        db.commit()

    # Step 3: Transcribe
    if video.status == "extracted":
        video.status = "transcribing"
        db.commit()

        result = transcribe_audio(video.audio_path, engine, model_name)

        md_path = write_markdown(
            video_id=video_id,
            title=video.title,
            url=video.url,
            channel=video.channel_name,
            duration_seconds=video.duration_seconds,
            engine=result["engine"],
            model_name=result["model_name"],
            text=result["raw_text"],
        )

        transcription = Transcription(
            id=str(uuid.uuid4()),
            video_id=video_id,
            engine=result["engine"],
            model_name=result["model_name"],
            language=result["language"],
            raw_text=result["raw_text"],
            markdown_path=md_path,
            duration_seconds=result["duration_seconds"],
        )
        db.add(transcription)

        video.transcription_path = md_path
        video.status = "completed"
        db.commit()
