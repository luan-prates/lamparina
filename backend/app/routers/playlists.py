from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.playlist import Playlist, PlaylistVideo
from app.models.video import Video
from app.schemas.playlist import (
    PlaylistCreate,
    PlaylistUpdate,
    PlaylistVideoAdd,
    PlaylistReorder,
    PlaylistResponse,
    PlaylistDetailResponse,
)
from app.schemas.video import VideoResponse

router = APIRouter(prefix="/playlists", tags=["playlists"])


@router.post("", response_model=PlaylistResponse, status_code=201)
def create_playlist(data: PlaylistCreate, db: Session = Depends(get_db)):
    playlist = Playlist(name=data.name, description=data.description)
    db.add(playlist)
    db.commit()
    db.refresh(playlist)
    return PlaylistResponse(
        id=playlist.id,
        name=playlist.name,
        description=playlist.description,
        video_count=0,
        created_at=playlist.created_at,
        updated_at=playlist.updated_at,
    )


@router.get("", response_model=list[PlaylistResponse])
def list_playlists(db: Session = Depends(get_db)):
    playlists = db.query(Playlist).order_by(Playlist.created_at.desc()).all()
    result = []
    for p in playlists:
        count = (
            db.query(PlaylistVideo)
            .filter(PlaylistVideo.playlist_id == p.id)
            .count()
        )
        result.append(
            PlaylistResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                video_count=count,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        )
    return result


@router.get("/{playlist_id}", response_model=PlaylistDetailResponse)
def get_playlist(playlist_id: str, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    pvs = (
        db.query(PlaylistVideo)
        .filter(PlaylistVideo.playlist_id == playlist_id)
        .order_by(PlaylistVideo.position)
        .all()
    )

    videos = []
    for pv in pvs:
        video = db.query(Video).filter(Video.id == pv.video_id).first()
        if video:
            videos.append(video)

    return PlaylistDetailResponse(
        id=playlist.id,
        name=playlist.name,
        description=playlist.description,
        video_count=len(videos),
        created_at=playlist.created_at,
        updated_at=playlist.updated_at,
        videos=[VideoResponse.model_validate(v) for v in videos],
    )


@router.put("/{playlist_id}", response_model=PlaylistResponse)
def update_playlist(
    playlist_id: str, data: PlaylistUpdate, db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    if data.name is not None:
        playlist.name = data.name
    if data.description is not None:
        playlist.description = data.description

    db.commit()
    db.refresh(playlist)

    count = (
        db.query(PlaylistVideo)
        .filter(PlaylistVideo.playlist_id == playlist_id)
        .count()
    )

    return PlaylistResponse(
        id=playlist.id,
        name=playlist.name,
        description=playlist.description,
        video_count=count,
        created_at=playlist.created_at,
        updated_at=playlist.updated_at,
    )


@router.delete("/{playlist_id}", status_code=204)
def delete_playlist(playlist_id: str, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    db.delete(playlist)
    db.commit()


@router.post("/{playlist_id}/videos", status_code=201)
def add_video_to_playlist(
    playlist_id: str, data: PlaylistVideoAdd, db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    video = db.query(Video).filter(Video.id == data.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    existing = (
        db.query(PlaylistVideo)
        .filter(
            PlaylistVideo.playlist_id == playlist_id,
            PlaylistVideo.video_id == data.video_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Video already in playlist")

    count = (
        db.query(PlaylistVideo)
        .filter(PlaylistVideo.playlist_id == playlist_id)
        .count()
    )

    pv = PlaylistVideo(
        playlist_id=playlist_id,
        video_id=data.video_id,
        position=count,
    )
    db.add(pv)
    db.commit()

    return {"status": "added"}


@router.delete("/{playlist_id}/videos/{video_id}", status_code=204)
def remove_video_from_playlist(
    playlist_id: str, video_id: str, db: Session = Depends(get_db)
):
    pv = (
        db.query(PlaylistVideo)
        .filter(
            PlaylistVideo.playlist_id == playlist_id,
            PlaylistVideo.video_id == video_id,
        )
        .first()
    )
    if not pv:
        raise HTTPException(status_code=404, detail="Video not in playlist")
    db.delete(pv)
    db.commit()


@router.put("/{playlist_id}/videos/reorder")
def reorder_playlist_videos(
    playlist_id: str, data: PlaylistReorder, db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    for i, video_id in enumerate(data.video_ids):
        pv = (
            db.query(PlaylistVideo)
            .filter(
                PlaylistVideo.playlist_id == playlist_id,
                PlaylistVideo.video_id == video_id,
            )
            .first()
        )
        if pv:
            pv.position = i

    db.commit()
    return {"status": "reordered"}
