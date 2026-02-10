from datetime import datetime

from pydantic import BaseModel


class PlatformCredentialCreate(BaseModel):
    platform_name: str
    platform_url: str
    auth_type: str  # "cookies" or "login"
    username: str | None = None
    password: str | None = None


class PlatformCredentialUpdate(BaseModel):
    platform_name: str | None = None
    platform_url: str | None = None
    auth_type: str | None = None
    username: str | None = None
    password: str | None = None


class PlatformCredentialResponse(BaseModel):
    id: str
    platform_name: str
    platform_url: str
    auth_type: str
    username: str | None = None
    password: str | None = None
    cookies_path: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_model(cls, credential) -> "PlatformCredentialResponse":
        return cls(
            id=credential.id,
            platform_name=credential.platform_name,
            platform_url=credential.platform_url,
            auth_type=credential.auth_type,
            username=credential.username,
            password="••••••" if credential.password else None,
            cookies_path=credential.cookies_path,
            created_at=credential.created_at,
            updated_at=credential.updated_at,
        )
