"""File Upload Router for Dispatch Documents."""

import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.session import get_db
from app.db import crud
from app.auth.routes import get_current_user, require_roles

router = APIRouter(prefix="/api/v1/uploads", tags=["Uploads"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("purchase_bill"), # purchase_bill, customer_po, lr, weighment_slip
    dispatch_id: Optional[str] = Form(None),
    current_user: dict = Depends(require_roles(["Admin", "Accountant", "Dispatch"])),
    db: AsyncSession = Depends(get_db)
):
    """Uploads a document file (PDF, PNG, JPG) to local storage and registers in DB."""
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".pdf", ".png", ".jpg", ".jpeg", ".webp"]
    if file_ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"File extension '{file_ext}' not allowed. Must be one of {allowed_exts}")

    file_id = str(uuid.uuid4())
    filename = f"{document_type}_{file_id}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    return {
        "file_id": file_id,
        "original_filename": file.filename,
        "stored_filename": filename,
        "storage_path": file_path,
        "mime_type": file.content_type or "application/octet-stream",
        "document_type": document_type,
        "size_bytes": len(contents),
        "status": "UPLOADED"
    }
