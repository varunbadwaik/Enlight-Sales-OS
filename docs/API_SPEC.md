# API Specification — Automated Draft Invoice Generation System (V1.0)

## Overview
FastAPI REST API specification for dispatch intake, Gemini AI document processing, normalization, validation engine, human approval, and Zoho Books integration.

Base URL: `http://localhost:8000/api/v1`

---

## Headers
- `Content-Type`: `application/json`
- `X-User-Role`: User role string (`Admin`, `Accountant`, `Dispatch`) for RBAC authorization checks.

---

## Endpoints

### 1. Health Check
`GET /health`
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "project": "Invoice Automation API",
  "version": "1.0.0",
  "env": "development"
}
```

### 2. Dispatch Intake
`POST /api/v1/dispatches/intake`
- **Allowed Roles**: `Admin`, `Accountant`, `Dispatch`
- **Request Payload**:
```json
{
  "po_number": "PO-98765",
  "dispatch_date": "2026-08-11",
  "documents": ["purchase_bill.pdf", "po.pdf", "lr.jpg", "weight_slip.jpg"],
  "whatsapp_message": "Purchase From: ABC Steel..."
}
```
- **Response**: `201 Created`
```json
{
  "dispatch_id": "DSP-001",
  "status": "DOCUMENTS_UPLOADED"
}
```

### 3. Dispatch Cross-Document Validation
`POST /api/v1/dispatches/{dispatch_id}/validate`
- **Allowed Roles**: `Admin`, `Accountant`
- **Response**: `200 OK`
```json
{
  "is_valid": true,
  "status": "VALIDATED",
  "results": [
    {
      "rule_name": "VEHICLE_MATCH",
      "status": "PASSED",
      "message": "Vehicle number 'MH12AB1234' matches across all documents."
    },
    {
      "rule_name": "WEIGHT_TOLERANCE",
      "status": "PASSED",
      "message": "Net weight diff (0.00%) is within allowed tolerance (1.0%)."
    },
    {
      "rule_name": "SELLING_RATE_PRESENCE",
      "status": "PASSED",
      "message": "Authoritative Customer PO selling rate ₹58/unit identified."
    }
  ],
  "selling_rate": 58.0,
  "purchase_rate": 50.0
}
```

### 4. Admin Approval
`POST /api/v1/dispatches/{dispatch_id}/approve`
- **Allowed Roles**: `Admin` (Enforced via RBAC)
- **Request Payload**:
```json
{
  "decision": "APPROVED",
  "comment": "All documents verified"
}
```
- **Response**: `200 OK`
```json
{
  "dispatch_id": "DSP-001",
  "status": "APPROVED"
}
```

### 5. Idempotent Zoho Draft Invoice Creation
`POST /api/v1/dispatches/{dispatch_id}/create-draft-invoice`
- **Allowed Roles**: `Admin` (Enforced via RBAC)
- **Precondition**: Dispatch status MUST be `APPROVED`.
- **Response**: `200 OK`
```json
{
  "invoice_id": "inv_zoho_DSP-001",
  "invoice_number": "INV-2026-DSP-001",
  "status": "draft",
  "selling_rate_applied": 58.0,
  "quantity": 12500.0,
  "source": "Customer PO (PO-98765)"
}
```

### 6. Audit Trail Retrieval
`GET /api/v1/dispatches/{dispatch_id}/audit-logs`
- **Allowed Roles**: `Admin`, `Accountant`
- **Response**: `200 OK` (Array of immutable audit events with timestamps, user actions, and status changes).
