from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transcription import Transcription
from app.schemas.transcription import TranscriptionResponse

router = APIRouter(prefix="/transcriptions", tags=["transcriptions"])


@router.get("", response_model=list[TranscriptionResponse])
def list_transcriptions(db: Session = Depends(get_db)):
    return (
        db.query(Transcription)
        .order_by(Transcription.created_at.desc())
        .limit(50)
        .all()
    )
