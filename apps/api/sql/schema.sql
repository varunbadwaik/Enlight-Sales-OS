-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Dispatches Table
CREATE TABLE IF NOT EXISTS dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100),
    customer_id UUID,
    customer_name VARCHAR(255),
    dispatch_date DATE,
    vehicle_number VARCHAR(50),
    weight_kg NUMERIC(12, 3),
    selling_rate NUMERIC(12, 2),
    purchase_rate NUMERIC(12, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED',
    zoho_project_id VARCHAR(100),
    zoho_purchase_bill_id VARCHAR(100),
    zoho_sales_invoice_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- purchase_bill, customer_po, lr, weighment_slip, whatsapp_dispatch
    storage_key TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID,
    processing_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Extracted Fields Table
CREATE TABLE IF NOT EXISTS extracted_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    raw_value TEXT,
    normalized_value TEXT,
    confidence NUMERIC(5, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Validation Results Table
CREATE TABLE IF NOT EXISTS validation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL, -- PASSED, FAILED, WARNING
    message TEXT,
    source_values JSONB,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL, -- APPROVED, REJECTED
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Integration Jobs Table
CREATE TABLE IF NOT EXISTS integration_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- ZOHO_BOOKS, AWS_S3, GEMINI
    operation VARCHAR(100) NOT NULL,
    request_reference TEXT,
    external_id VARCHAR(100),
    status VARCHAR(30) NOT NULL, -- SUCCESS, FAILED, RETRYING
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Logs Table (Immutable Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON dispatches(status);
CREATE INDEX IF NOT EXISTS idx_documents_dispatch_id ON documents(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_validation_results_dispatch_id ON validation_results(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_dispatch_id ON audit_logs(dispatch_id);
