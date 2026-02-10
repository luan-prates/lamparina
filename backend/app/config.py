from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///storage/db/study.db"
    storage_path: str = "storage"
    whisper_engine: str = "whisper_local"
    whisper_model: str = "base"
    openai_api_key: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()
