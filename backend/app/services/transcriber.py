import os
import time

from app.config import settings


def transcribe_audio(
    audio_path: str,
    engine: str | None = None,
    model_name: str | None = None,
) -> dict:
    engine = engine or settings.whisper_engine
    model_name = model_name or settings.whisper_model
    full_audio_path = os.path.join(settings.storage_path, audio_path)

    start = time.time()

    if engine == "openai_api":
        text, language = _transcribe_openai(full_audio_path, model_name)
    else:
        text, language = _transcribe_local(full_audio_path, model_name)

    elapsed = int(time.time() - start)

    return {
        "engine": engine,
        "model_name": model_name,
        "language": language,
        "raw_text": text,
        "duration_seconds": elapsed,
    }


def _transcribe_local(audio_path: str, model_name: str) -> tuple[str, str]:
    import whisper

    model = whisper.load_model(model_name)
    result = model.transcribe(audio_path)
    return result["text"], result.get("language", "")


def _transcribe_openai(audio_path: str, model_name: str) -> tuple[str, str]:
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    with open(audio_path, "rb") as f:
        response = client.audio.transcriptions.create(
            model=model_name or "whisper-1",
            file=f,
        )
    return response.text, ""
