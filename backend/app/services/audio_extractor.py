import os
import subprocess

from app.config import settings


def extract_audio(video_id: str, video_path: str) -> str:
    full_video_path = os.path.join(settings.storage_path, video_path)
    output_dir = os.path.join(settings.storage_path, "videos", video_id)
    audio_path = os.path.join(output_dir, "audio.wav")

    subprocess.run(
        [
            "ffmpeg",
            "-i", full_video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            "-y",
            audio_path,
        ],
        check=True,
        capture_output=True,
    )

    return os.path.join("videos", video_id, "audio.wav")
