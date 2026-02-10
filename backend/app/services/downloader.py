import os
from urllib.parse import urlparse

import yt_dlp
from sqlalchemy.orm import Session

from app.config import settings
from app.models.platform_credential import PlatformCredential


def _find_credential(db: Session, url: str) -> PlatformCredential | None:
    domain = urlparse(url).hostname or ""
    credentials = db.query(PlatformCredential).all()
    for cred in credentials:
        if cred.platform_url in domain:
            return cred
    return None


def download_video(video_id: str, url: str, db: Session | None = None) -> dict:
    output_dir = os.path.join(settings.storage_path, "videos", video_id)
    os.makedirs(output_dir, exist_ok=True)

    output_template = os.path.join(output_dir, "video.%(ext)s")

    ydl_opts = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "outtmpl": output_template,
        "merge_output_format": "mp4",
        "quiet": True,
        "no_warnings": True,
    }

    # Apply platform credentials if available
    if db:
        credential = _find_credential(db, url)
        if credential:
            if credential.auth_type == "cookies" and credential.cookies_path:
                cookies_abs = os.path.join(settings.storage_path, credential.cookies_path)
                if os.path.exists(cookies_abs):
                    ydl_opts["cookiefile"] = cookies_abs
            elif credential.auth_type == "login" and credential.username:
                ydl_opts["username"] = credential.username
                ydl_opts["password"] = credential.password or ""

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    video_path = None
    for f in os.listdir(output_dir):
        if f.startswith("video."):
            video_path = os.path.join("videos", video_id, f)
            break

    return {
        "title": info.get("title"),
        "description": info.get("description"),
        "duration_seconds": info.get("duration"),
        "thumbnail_url": info.get("thumbnail"),
        "channel_name": info.get("channel") or info.get("uploader"),
        "video_path": video_path,
    }
