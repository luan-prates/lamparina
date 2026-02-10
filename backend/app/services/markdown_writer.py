import os
from datetime import datetime

from app.config import settings


def write_markdown(
    video_id: str,
    title: str,
    url: str,
    channel: str | None,
    duration_seconds: int | None,
    engine: str,
    model_name: str | None,
    text: str,
) -> str:
    output_dir = os.path.join(settings.storage_path, "videos", video_id)
    os.makedirs(output_dir, exist_ok=True)
    md_path = os.path.join(output_dir, "transcription.md")

    duration_str = ""
    if duration_seconds:
        hours, remainder = divmod(duration_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        if hours:
            duration_str = f"{hours}h {minutes}m {seconds}s"
        else:
            duration_str = f"{minutes}m {seconds}s"

    content = f"""# {title or 'Sem título'}

- **Fonte**: {url}
- **Canal**: {channel or 'Desconhecido'}
- **Duração**: {duration_str or 'N/A'}
- **Transcrito em**: {datetime.now().strftime('%Y-%m-%d %H:%M')} via {engine} ({model_name or 'N/A'})

---

## Transcrição

{text}
"""

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(content)

    return os.path.join("videos", video_id, "transcription.md")
