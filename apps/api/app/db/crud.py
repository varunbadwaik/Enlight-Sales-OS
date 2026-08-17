"""Database CRUD operations for Enlight Sales OS."""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    Dispatch, Document, ExtractedField, ValidationResult,
    Approval, IntegrationJob, AuditLog, WhatsAppSession, WhatsAppDocument
)


# ─── Dispatch CRUD ───────────────────────────────────────────────

async def create_dispatch(
    db: AsyncSession,
    po_number: str,
    dispatch_date: date,
    documents: List[str],
    whatsapp_message: Optional[str] = None,
    customer_name: Optional[str] = None,
    vehicle_number: Optional[str] = None,
    weight_kg: Optional[Decimal] = None,
    selling_rate: Optional[Decimal] = None,
    purchase_rate: Optional[Decimal] = None,
    source: str = "WEB",
) -> Dispatch:
    dispatch = Dispatch(
        po_number=po_number,
        dispatch_date=dispatch_date,
        customer_name=customer_name,
        vehicle_number=vehicle_number,
        weight_kg=weight_kg,
        selling_rate=selling_rate,
        purchase_rate=purchase_rate,
        status="DOCUMENTS_UPLOADED",
        source=source,
    )
    db.add(dispatch)
    await db.commit()
    await db.refresh(dispatch)
    return dispatch


async def get_dispatch(db: AsyncSession, dispatch_id: uuid.UUID) -> Optional[Dispatch]:
    result = await db.execute(select(Dispatch).where(Dispatch.id == dispatch_id))
    return result.scalar_one_or_none()


async def get_dispatch_by_po(db: AsyncSession, po_number: str) -> Optional[Dispatch]:
    result = await db.execute(select(Dispatch).where(Dispatch.po_number == po_number))
    return result.scalar_one_or_none()


async def list_dispatches(db: AsyncSession, limit: int = 50) -> List[Dispatch]:
    result = await db.execute(
        select(Dispatch).order_by(Dispatch.created_at.desc()).limit(limit)
    )
    return list(result.scalars().all())


async def update_dispatch_status(
    db: AsyncSession, dispatch_id: uuid.UUID, new_status: str
) -> Optional[Dispatch]:
    dispatch = await get_dispatch(db, dispatch_id)
    if dispatch:
        dispatch.status = new_status
        dispatch.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(dispatch)
    return dispatch


async def update_dispatch_fields(
    db: AsyncSession, dispatch_id: uuid.UUID, **fields
) -> Optional[Dispatch]:
    dispatch = await get_dispatch(db, dispatch_id)
    if dispatch:
        for key, value in fields.items():
            if hasattr(dispatch, key):
                setattr(dispatch, key, value)
        dispatch.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(dispatch)
    return dispatch


# ─── Document CRUD ───────────────────────────────────────────────

async def create_document(
    db: AsyncSession,
    dispatch_id: uuid.UUID,
    document_type: str,
    storage_key: str,
    original_filename: str,
    mime_type: str,
) -> Document:
    doc = Document(
        dispatch_id=dispatch_id,
        document_type=document_type,
        storage_key=storage_key,
        original_filename=original_filename,
        mime_type=mime_type,
        processing_status="PENDING",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


async def get_documents_for_dispatch(db: AsyncSession, dispatch_id: uuid.UUID) -> List[Document]:
    result = await db.execute(
        select(Document).where(Document.dispatch_id == dispatch_id)
    )
    return list(result.scalars().all())


# ─── Extracted Field CRUD ────────────────────────────────────────

async def create_extracted_field(
    db: AsyncSession,
    document_id: uuid.UUID,
    field_name: str,
    raw_value: str,
    normalized_value: Optional[str] = None,
    confidence: Optional[Decimal] = None,
) -> ExtractedField:
    field = ExtractedField(
        document_id=document_id,
        field_name=field_name,
        raw_value=raw_value,
        normalized_value=normalized_value or raw_value,
        confidence=confidence,
    )
    db.add(field)
    await db.commit()
    await db.refresh(field)
    return field


# ─── Validation CRUD ─────────────────────────────────────────────

async def create_validation_result(
    db: AsyncSession,
    dispatch_id: uuid.UUID,
    rule_name: str,
    status: str,
    message: Optional[str] = None,
    source_values: Optional[dict] = None,
) -> ValidationResult:
    vr = ValidationResult(
        dispatch_id=dispatch_id,
        rule_name=rule_name,
        status=status,
        message=message,
        source_values=source_values,
    )
    db.add(vr)
    await db.commit()
    await db.refresh(vr)
    return vr


# ─── Approval CRUD ───────────────────────────────────────────────

async def create_approval(
    db: AsyncSession,
    dispatch_id: uuid.UUID,
    approver_id: uuid.UUID,
    status: str,
    comment: Optional[str] = None,
) -> Approval:
    approval = Approval(
        dispatch_id=dispatch_id,
        approver_id=approver_id,
        status=status,
        comment=comment,
    )
    db.add(approval)
    await db.commit()
    await db.refresh(approval)
    return approval


# ─── Audit Log CRUD ──────────────────────────────────────────────

async def create_audit_log(
    db: AsyncSession,
    dispatch_id: uuid.UUID,
    action: str,
    user_id: Optional[uuid.UUID] = None,
    old_value: Optional[dict] = None,
    new_value: Optional[dict] = None,
) -> AuditLog:
    log = AuditLog(
        dispatch_id=dispatch_id,
        user_id=user_id,
        action=action,
        old_value=old_value,
        new_value=new_value,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_audit_logs_for_dispatch(
    db: AsyncSession, dispatch_id: uuid.UUID
) -> List[AuditLog]:
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.dispatch_id == dispatch_id)
        .order_by(AuditLog.created_at.asc())
    )
    return list(result.scalars().all())


# ─── Integration Job CRUD ────────────────────────────────────────

async def create_integration_job(
    db: AsyncSession,
    dispatch_id: uuid.UUID,
    provider: str,
    operation: str,
    status: str = "PENDING",
    external_id: Optional[str] = None,
    error_message: Optional[str] = None,
) -> IntegrationJob:
    job = IntegrationJob(
        dispatch_id=dispatch_id,
        provider=provider,
        operation=operation,
        status=status,
        external_id=external_id,
        error_message=error_message,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


# ─── WhatsApp Session & Document CRUD ────────────────────────────────

async def get_active_whatsapp_session(
    db: AsyncSession, whatsapp_number: str
) -> Optional[WhatsAppSession]:
    result = await db.execute(
        select(WhatsAppSession)
        .where(
            WhatsAppSession.whatsapp_number == whatsapp_number,
            WhatsAppSession.session_status == "COLLECTING"
        )
        .order_by(WhatsAppSession.created_at.desc())
    )
    return result.scalars().first()


async def create_whatsapp_session(
    db: AsyncSession, whatsapp_number: str, po_number: Optional[str] = None
) -> WhatsAppSession:
    session = WhatsAppSession(
        whatsapp_number=whatsapp_number,
        po_number=po_number,
        session_status="COLLECTING"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def get_whatsapp_session_by_id(
    db: AsyncSession, session_id: uuid.UUID
) -> Optional[WhatsAppSession]:
    result = await db.execute(
        select(WhatsAppSession).where(WhatsAppSession.id == session_id)
    )
    return result.scalar_one_or_none()


async def list_whatsapp_sessions(
    db: AsyncSession, limit: int = 50
) -> List[WhatsAppSession]:
    result = await db.execute(
        select(WhatsAppSession)
        .order_by(WhatsAppSession.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def update_whatsapp_session_document(
    db: AsyncSession, session_id: uuid.UUID, doc_type: str
) -> Optional[WhatsAppSession]:
    session = await get_whatsapp_session_by_id(db, session_id)
    if session:
        dt = doc_type.upper()
        if dt in ["PURCHASE_ORDER", "CUSTOMER_PO", "PO"]:
            session.doc_purchase_order = True
        elif dt in ["PURCHASE_BILL", "VENDOR_BILL", "BILL"]:
            session.doc_purchase_bill = True
        elif dt in ["LORRY_RECEIPT", "LR"]:
            session.doc_lorry_receipt = True
        elif dt in ["WEIGHT_SLIP", "WEIGHMENT_SLIP", "WEIGHT"]:
            session.doc_weight_slip = True
        session.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(session)
    return session


async def update_whatsapp_session_status(
    db: AsyncSession,
    session_id: uuid.UUID,
    session_status: str,
    dispatch_id: Optional[uuid.UUID] = None,
    invoice_id: Optional[str] = None
) -> Optional[WhatsAppSession]:
    session = await get_whatsapp_session_by_id(db, session_id)
    if session:
        session.session_status = session_status
        if dispatch_id:
            session.dispatch_id = dispatch_id
        if invoice_id:
            session.invoice_id = invoice_id
        session.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(session)
    return session


async def create_whatsapp_document(
    db: AsyncSession,
    session_id: uuid.UUID,
    document_type: str,
    file_name: Optional[str] = None,
    mime_type: Optional[str] = None,
    storage_url: Optional[str] = None
) -> WhatsAppDocument:
    doc = WhatsAppDocument(
        session_id=session_id,
        document_type=document_type,
        file_name=file_name,
        mime_type=mime_type,
        storage_url=storage_url
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


async def get_whatsapp_documents_for_session(
    db: AsyncSession, session_id: uuid.UUID
) -> List[WhatsAppDocument]:
    result = await db.execute(
        select(WhatsAppDocument).where(WhatsAppDocument.session_id == session_id)
    )
    return list(result.scalars().all())

