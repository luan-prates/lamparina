import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.platform_credential import PlatformCredential
from app.schemas.platform_credential import (
    PlatformCredentialCreate,
    PlatformCredentialUpdate,
    PlatformCredentialResponse,
)

router = APIRouter(prefix="/credentials", tags=["credentials"])


@router.post("/", response_model=PlatformCredentialResponse)
def create_credential(data: PlatformCredentialCreate, db: Session = Depends(get_db)):
    credential = PlatformCredential(
        platform_name=data.platform_name,
        platform_url=data.platform_url,
        auth_type=data.auth_type,
        username=data.username,
        password=data.password,
    )
    db.add(credential)
    db.commit()
    db.refresh(credential)
    return PlatformCredentialResponse.from_model(credential)


@router.get("/", response_model=list[PlatformCredentialResponse])
def list_credentials(db: Session = Depends(get_db)):
    credentials = db.query(PlatformCredential).order_by(PlatformCredential.created_at.desc()).all()
    return [PlatformCredentialResponse.from_model(c) for c in credentials]


@router.put("/{credential_id}", response_model=PlatformCredentialResponse)
def update_credential(credential_id: str, data: PlatformCredentialUpdate, db: Session = Depends(get_db)):
    credential = db.query(PlatformCredential).filter(PlatformCredential.id == credential_id).first()
    if not credential:
        raise HTTPException(status_code=404, detail="Credencial não encontrada")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(credential, field, value)

    db.commit()
    db.refresh(credential)
    return PlatformCredentialResponse.from_model(credential)


@router.delete("/{credential_id}", status_code=204)
def delete_credential(credential_id: str, db: Session = Depends(get_db)):
    credential = db.query(PlatformCredential).filter(PlatformCredential.id == credential_id).first()
    if not credential:
        raise HTTPException(status_code=404, detail="Credencial não encontrada")

    # Remove cookies directory if exists
    cookies_dir = os.path.join(settings.storage_path, "cookies", credential_id)
    if os.path.exists(cookies_dir):
        shutil.rmtree(cookies_dir)

    db.delete(credential)
    db.commit()


@router.post("/{credential_id}/cookies", response_model=PlatformCredentialResponse)
def upload_cookies(credential_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    credential = db.query(PlatformCredential).filter(PlatformCredential.id == credential_id).first()
    if not credential:
        raise HTTPException(status_code=404, detail="Credencial não encontrada")

    cookies_dir = os.path.join(settings.storage_path, "cookies", credential_id)
    os.makedirs(cookies_dir, exist_ok=True)

    cookies_file = os.path.join(cookies_dir, "cookies.txt")
    with open(cookies_file, "wb") as f:
        content = file.file.read()
        f.write(content)

    credential.cookies_path = os.path.join("cookies", credential_id, "cookies.txt")
    db.commit()
    db.refresh(credential)
    return PlatformCredentialResponse.from_model(credential)
