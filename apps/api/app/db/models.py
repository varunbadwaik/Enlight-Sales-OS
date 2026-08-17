import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Numeric, Date, DateTime, ForeignKey, JSON, Boolean
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Dispatch")  # Admin, Accountant, Dispatch
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class Dispatch(Base):
    __tablename__ = "dispatches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    po_number = Column(String(100), nullable=True)
    customer_id = Column(UUID(as_uuid=True), nullable=True)
    customer_name = Column(String(255), nullable=True)
    dispatch_date = Column(Date, nullable=True)
    vehicle_number = Column(String(50), nullable=True)
    weight_kg = Column(Numeric(12, 3), nullable=True)
    selling_rate = Column(Numeric(12, 2), nullable=True)
    purchase_rate = Column(Numeric(12, 2), nullable=True)
    status = Column(String(50), default="RECEIVED", nullable=False)
    source = Column(String(20), default="WEB", nullable=False)  # WEB, WHATSAPP
    zoho_project_id = Column(String(100), nullable=True)
    zoho_purchase_bill_id = Column(String(100), nullable=True)
    zoho_sales_invoice_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    documents = relationship("Document", back_populates="dispatch", cascade="all, delete-orphan")
    validation_results = relationship("ValidationResult", back_populates="dispatch", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="dispatch", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="dispatch", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dispatch_id = Column(UUID(as_uuid=True), ForeignKey("dispatches.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(50), nullable=False)
    storage_key = Column(Text, nullable=False)
    original_filename = Column(Text, nullable=False)
    mime_type = Column(String(100), nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), nullable=True)
    processing_status = Column(String(50), default="PENDING")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    dispatch = relationship("Dispatch", back_populates="documents")
    extracted_fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String(100), nullable=False)
    raw_value = Column(Text, nullable=True)
    normalized_value = Column(Text, nullable=True)
    confidence = Column(Numeric(5, 4), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    document = relationship("Document", back_populates="extracted_fields")

class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dispatch_id = Column(UUID(as_uuid=True), ForeignKey("dispatches.id", ondelete="CASCADE"), nullable=False)
    rule_name = Column(String(100), nullable=False)
    status = Column(String(30), nullable=False) # PASSED, FAILED, WARNING
    message = Column(Text, nullable=True)
    source_values = Column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    resolved_by = Column(UUID(as_uuid=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    dispatch = relationship("Dispatch", back_populates="validation_results")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dispatch_id = Column(UUID(as_uuid=True), ForeignKey("dispatches.id", ondelete="CASCADE"), nullable=False)
    approver_id = Column(UUID(as_uuid=True), nullable=False)
    status = Column(String(30), nullable=False) # APPROVED, REJECTED
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    dispatch = relationship("Dispatch", back_populates="approvals")

class IntegrationJob(Base):
    __tablename__ = "integration_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dispatch_id = Column(UUID(as_uuid=True), ForeignKey("dispatches.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(50), nullable=False)
    operation = Column(String(100), nullable=False)
    request_reference = Column(Text, nullable=True)
    external_id = Column(String(100), nullable=True)
    status = Column(String(30), nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dispatch_id = Column(UUID(as_uuid=True), ForeignKey("dispatches.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    action = Column(String(100), nullable=False)
    old_value = Column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    new_value = Column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    metadata_info = Column("metadata", JSON().with_variant(JSONB, "postgresql"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    dispatch = relationship("Dispatch", back_populates="audit_logs")


class WhatsAppSession(Base):
    """Tracks a WhatsApp document-collection conversation."""
    __tablename__ = "whatsapp_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    whatsapp_number = Column(String(20), nullable=False, index=True)
    session_status = Column(String(30), default="COLLECTING", nullable=False)  # COLLECTING, PROCESSING, COMPLETED, FAILED
    po_number = Column(String(100), nullable=True)
    dispatch_id = Column(UUID(as_uuid=True), ForeignKey("dispatches.id", ondelete="SET NULL"), nullable=True)
    invoice_id = Column(String(100), nullable=True)
    doc_purchase_order = Column(Boolean, default=False, nullable=False)
    doc_purchase_bill = Column(Boolean, default=False, nullable=False)
    doc_lorry_receipt = Column(Boolean, default=False, nullable=False)
    doc_weight_slip = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    wa_documents = relationship("WhatsAppDocument", back_populates="session", cascade="all, delete-orphan")


class WhatsAppDocument(Base):
    """Metadata for a document received via WhatsApp."""
    __tablename__ = "whatsapp_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("whatsapp_sessions.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(50), nullable=False)  # PURCHASE_ORDER, PURCHASE_BILL, LORRY_RECEIPT, WEIGHT_SLIP
    file_name = Column(Text, nullable=True)
    mime_type = Column(String(100), nullable=True)
    storage_url = Column(Text, nullable=True)
    received_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    session = relationship("WhatsAppSession", back_populates="wa_documents")
