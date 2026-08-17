# PRD — Automated Draft Invoice Generation System

## 1. Product Overview

**Product Name:** Automated Draft Invoice Generation System  
**Version:** V1.0  
**Status:** Draft  
**Primary Users:** Dispatch/Sales Team, Accountant, Admin  
**Core Accounting System:** Zoho Books

### Product Goal

Automate the preparation of Zoho Books draft sales invoices from dispatch documents while keeping financial approval and statutory compliance under human control.

The system receives a dispatch package containing:

1. Customer Purchase Order (PO)
2. Vendor Purchase Bill
3. Lorry Receipt (LR)
4. Weighment Slip
5. Standardized WhatsApp dispatch information

AI extracts structured data, the backend normalizes and validates it across documents, Zoho Books is updated through its APIs, an admin approves the transaction, and the system creates a Sales Invoice in **Draft** status.

The system must not automatically finalize invoices, generate e-Invoices/E-Way Bills, or apply digital signatures in V1.

---

## 2. Problem Statement

The current process requires employees to manually read several dispatch documents and enter the same information into Zoho Books.

This can cause:

- Manual data-entry errors
- Incorrect vehicle/LR information
- Incorrect quantity or weight
- Wrong customer/PO mapping
- Incorrect GST information
- Incorrect purchase/sales rate mapping
- Repeated data entry
- Invoice preparation delays
- Poor traceability of where invoice fields came from

The product should reduce manual work while improving validation, consistency, and auditability.

---

## 3. Product Vision

Build a human-in-the-loop accounting automation platform:

```text
Dispatch Documents
      ↓
AI Extraction
      ↓
Data Normalization
      ↓
Cross-Document Validation
      ↓
Zoho Books Purchase Transaction
      ↓
Admin Approval
      ↓
Customer PO Selling-Rate Mapping
      ↓
Draft Sales Invoice
      ↓
Accountant Finalization
```

---

## 4. Goals

### Primary Goals

- Extract structured information from dispatch documents.
- Parse standardized WhatsApp dispatch messages.
- Match documents belonging to the same dispatch.
- Validate critical fields across sources.
- Find/create the Zoho Books project using the Customer PO.
- Prepare the purchase bill in Zoho Books.
- Require admin approval before invoice creation.
- Create the Sales Invoice in **Draft** status.
- Always use the Customer PO selling rate for the sales invoice.
- Maintain an audit trail for extraction, validation, approval, correction, and invoice creation.

### Secondary Goals

- Reduce invoice preparation time.
- Reduce duplicate manual entry.
- Make exceptions visible.
- Allow human correction of AI output.
- Make failed integrations recoverable.

---

## 5. Non-Goals

V1 will not:

- Automatically finalize/submitted invoices.
- Automatically generate or submit statutory e-Invoices.
- Automatically generate or submit E-Way Bills.
- Apply digital signatures.
- Replace accountant/admin approval.
- Resolve ambiguous financial information without human review.
- Treat AI output as trusted accounting data without validation.

---

## 6. Users and Roles

### Dispatch/Sales User

Can:

- Create dispatch records.
- Upload documents.
- Submit standardized dispatch information.
- View assigned dispatches.
- View validation errors.

### Accountant

Can:

- Review extracted information.
- Correct extracted data.
- Prepare/verify purchase bills.
- Monitor draft invoices.
- Complete final accounting steps.

### Admin/Approver

Can:

- Review transactions.
- Approve/reject transactions.
- Review GST/TDS-related information.
- Resolve exceptions.
- View audit logs.

### System Administrator

Can:

- Configure integrations.
- Manage users/roles.
- Configure validation rules.
- Monitor jobs.
- Manage system settings.

---

## 7. Input Documents

### 7.1 Customer Purchase Order

Expected fields:

- Customer
- PO number
- PO date
- Material/grade
- Size/specification
- Quantity
- Selling rate
- Delivery terms
- Destination

### 7.2 Vendor Purchase Bill

Expected fields:

- Vendor
- Bill number
- Bill date
- Material
- Quantity
- Purchase rate
- GST
- Vehicle number
- Delivery details
- E-Way Bill where available
- DC details

### 7.3 Weighment Slip

Expected fields:

- Vehicle number
- Gross weight
- Tare weight
- Net weight
- Weighment date/time
- Slip number where available

### 7.4 Lorry Receipt (LR)

Expected fields:

- LR number
- Vehicle number
- Transporter
- Consignor
- Consignee
- Destination
- Freight information where available

### 7.5 WhatsApp Dispatch Message

Preferred template:

```text
Purchase From:
Sale To:
Delivery As Per:
DO:
SO:
Grade:
Size:
Weight:
Vehicle No:
Driver:
Transport:
Dispatch:
```

The system shall parse this into structured fields.

---

## 8. Functional Requirements

### FR-01 — Dispatch Creation

Authorized users shall be able to create a dispatch record.

Fields:

- Customer/PO reference
- Dispatch date
- Source channel
- Documents
- Notes

Initial status:

`RECEIVED`

### FR-02 — Document Upload

Supported formats:

- PDF
- JPG/JPEG
- PNG

Document types:

- Customer PO
- Purchase Bill
- LR
- Weighment Slip
- WhatsApp Message
- Other/Unknown

Documents shall be stored in object storage and referenced from the database.

### FR-03 — AI Document Extraction

Use a multimodal document model such as Gemini to extract structured data.

Example:

```json
{
  "document_type": "purchase_bill",
  "vendor": "ABC Steel",
  "invoice_number": "INV-12345",
  "vehicle_number": "MH12AB1234",
  "quantity": 12500,
  "unit": "KG",
  "purchase_rate": 50,
  "gst_rate": 18
}
```

The extraction layer shall retain source document references and extraction metadata.

### FR-04 — WhatsApp Parsing

Example normalized output:

```json
{
  "purchase_from": "ABC Steel",
  "sale_to": "XYZ Industries",
  "po_number": "PO-98765",
  "sales_officer": "Rahul",
  "grade": "HR Plate",
  "size": "10x1500x6300",
  "weight_kg": 12500,
  "vehicle_number": "MH12AB1234",
  "transporter": "XYZ Transport",
  "dispatch_location": "Pune"
}
```

Missing required fields shall create a correction task.

### FR-05 — Data Normalization

Examples:

- `MH 12 AB 1234` → `MH12AB1234`
- `12.5 MT` → `12500 KG`
- Normalize dates.
- Normalize PO numbers.
- Normalize identifiers and case.

Original source values must remain available for audit.

### FR-06 — Cross-Document Validation

Validate:

**Vehicle:** Purchase Bill ↔ LR ↔ Weighment Slip ↔ WhatsApp

**Customer:** PO ↔ WhatsApp ↔ Zoho Books

**Weight:** Weighment Slip ↔ WhatsApp ↔ Purchase Bill where applicable

**PO:** Customer PO ↔ WhatsApp ↔ Zoho Project

**Material:** Customer PO ↔ Purchase Bill ↔ WhatsApp

**Selling Rate:** Customer PO is authoritative.

Example:

```text
Purchase Rate:      ₹50/kg
Customer PO Rate:   ₹58/kg

Sales Invoice Rate: ₹58/kg
```

The purchase rate must never silently replace the customer selling rate.

### FR-07 — Exception Handling

Example:

```text
VALIDATION ERROR

Vehicle mismatch

Weight Slip: MH12AB5678
WhatsApp:    MH12AB1234

Manual verification required.
```

Statuses:

- OPEN
- UNDER_REVIEW
- RESOLVED
- IGNORED_WITH_REASON

Critical unresolved errors must block invoice creation.

### FR-08 — Zoho Books Integration

Use Zoho Books APIs with OAuth 2.0.

Required capabilities:

- Customer lookup
- Vendor lookup
- Project lookup/create
- Purchase bill creation
- Transaction retrieval
- Sales invoice creation
- Draft invoice updates where supported

### FR-09 — Project Creation/Linking

Customer PO is the primary business reference.

Example:

```text
PO-98765
   ↓
Zoho Project: PO-98765
```

Search for an existing project before creating one.

### FR-10 — Purchase Bill Preparation

Prepare/create purchase bill with validated:

- Vendor
- Bill number/date
- Vehicle
- LR
- Material
- Quantity
- Purchase rate
- GST
- TDS where applicable
- Customer
- Project
- Billable status

Detect duplicate vendor bill numbers before creation.

### FR-11 — Approval Workflow

Workflow:

```text
EXTRACTED
   ↓
VALIDATED
   ↓
PENDING_APPROVAL
   ↓
APPROVED
```

Rejection:

```text
PENDING_APPROVAL
   ↓
REJECTED
   ↓
CORRECTION_REQUIRED
```

Log approver, timestamp, decision, and comment.

### FR-12 — Sales Invoice Generation

Only after validation and approval, create a Sales Invoice in:

`DRAFT`

Populate:

- Customer
- Customer address
- PO number/date
- Salesperson
- Material
- Quantity/weight
- Vehicle
- Driver
- LR
- Transporter
- Destination
- GST
- Selling rate

### FR-13 — Selling Rate Override

Mandatory business rule:

```text
Vendor Purchase Rate
        ↓
      NOT the
    sales rate

Customer PO Rate
        ↓
  Sales Invoice Rate
```

Store the source of the applied selling rate.

### FR-14 — Draft-Only Protection

V1 must stop at:

```text
CREATE DRAFT
     ↓
STOP
```

No automatic:

- Invoice submission/finalization
- E-Invoice
- E-Way Bill
- Digital signature

UI status:

`DRAFT CREATED — ACCOUNTANT ACTION REQUIRED`

### FR-15 — Manual Correction

Store:

- Original value
- Corrected value
- User
- Timestamp
- Reason

Example:

```text
AI Extracted: MH12AB1234
Corrected:    MH12AB5678
Reason:       Corrected against original LR
```

### FR-16 — Audit Trail

Log:

- Document upload
- AI extraction
- Field correction
- Validation result
- Zoho API result
- Purchase bill creation
- Approval/rejection
- Draft invoice creation
- Errors/retries

---

## 9. Workflow States

```text
RECEIVED
   ↓
DOCUMENTS_UPLOADED
   ↓
PROCESSING
   ↓
EXTRACTED
   ↓
VALIDATING
   ↓
VALIDATED
   ↓
PENDING_APPROVAL
   ↓
APPROVED
   ↓
PURCHASE_BILL_READY
   ↓
DRAFT_INVOICE_CREATED
   ↓
COMPLETED
```

Exception path:

```text
ANY STATE
   ↓
ERROR / EXCEPTION
   ↓
MANUAL_REVIEW
   ↓
RESOLVED
   ↓
RESUME
```

---

## 10. Recommended Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js + TypeScript | Admin dashboard |
| UI | Tailwind CSS + shadcn/ui | User interface |
| Backend | Python + FastAPI | Core APIs/business logic |
| AI | Google Gemini API | Document understanding |
| Database | PostgreSQL / Supabase | Application data |
| File Storage | AWS S3 | PDFs/images/documents |
| Accounting | Zoho Books API | Bills/projects/invoices |
| Messaging | WhatsApp Business Platform | Dispatch messages |
| Workflow | n8n (optional) | External orchestration |
| Queue | Redis + Celery | Background processing |
| Auth | Supabase Auth | Authentication |
| Monitoring | Sentry | Error monitoring |
| Version Control | GitHub | Source control |
| Frontend Hosting | Vercel | Web application |
| Backend Hosting | Render/Railway | API/workers |

---

## 11. High-Level Architecture

```text
                    ┌───────────────────┐
                    │ WhatsApp Business │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Webhook / n8n     │
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
       PDFs / Images                    WhatsApp Text
              │                               │
              └───────────────┬───────────────┘
                              ▼
                    ┌───────────────────┐
                    │   FastAPI Backend │
                    └─────────┬─────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
            ┌────────┐  ┌──────────┐  ┌──────────┐
            │ Gemini │  │PostgreSQL│  │ AWS S3   │
            │  AI    │  │/Supabase │  │ Storage  │
            └───┬────┘  └────┬─────┘  └──────────┘
                │             │
                └──────┬──────┘
                       ▼
                Validation Engine
                       │
                       ▼
                  Zoho Books
                       │
              ┌────────┴────────┐
              ▼                 ▼
       Purchase Bill       Draft Invoice
              │
              ▼
        Admin Approval
              │
              ▼
          Accountant
```

---

## 12. Data Model

### Dispatch

```text
id
po_number
customer_id
dispatch_date
vehicle_number
weight_kg
status
created_at
updated_at
```

### Document

```text
id
dispatch_id
document_type
storage_key
original_filename
mime_type
uploaded_by
uploaded_at
processing_status
```

### Extracted Field

```text
id
document_id
field_name
raw_value
normalized_value
confidence
created_at
```

### Validation Result

```text
id
dispatch_id
rule_name
status
source_values
message
resolved_by
resolved_at
```

### Approval

```text
id
dispatch_id
approver_id
status
comment
created_at
```

### Integration Job

```text
id
dispatch_id
provider
operation
request_reference
external_id
status
error_message
created_at
```

### Audit Log

```text
id
dispatch_id
user_id
action
old_value
new_value
metadata
created_at
```

---

## 13. AI Extraction Contract

AI should return structured JSON, not free-form text.

Example:

```json
{
  "document_type": "weighment_slip",
  "fields": {
    "vehicle_number": {
      "value": "MH12AB1234",
      "confidence": 0.98
    },
    "gross_weight_kg": {
      "value": 25000,
      "confidence": 0.97
    },
    "tare_weight_kg": {
      "value": 12500,
      "confidence": 0.96
    },
    "net_weight_kg": {
      "value": 12500,
      "confidence": 0.99
    }
  }
}
```

The backend must validate the AI response against a server-side schema before using it.

---

## 14. Security Requirements

- HTTPS only.
- OAuth 2.0 for Zoho.
- Secrets stored in environment variables/secret manager.
- No API keys in GitHub.
- Validate incoming webhooks.
- Rate-limit public endpoints.
- Private S3 buckets.
- Signed URLs for temporary document access.
- Role-based access control.
- Audit all accounting-impacting actions.
- Encrypt sensitive data at rest where supported.

---

## 15. Error Handling and Reliability

Handle:

- Gemini timeout/failure
- Zoho API timeout/failure
- S3 upload failure
- WhatsApp webhook failure
- Database failure

For transient failures:

1. Record the error.
2. Mark the job retryable.
3. Retry safely.
4. Prevent duplicate accounting transactions.
5. Show the failure to users.
6. Allow manual retry.

### Idempotency

Before creating a transaction, check stable business identifiers such as:

- Vendor + Bill Number
- Customer + PO + Dispatch Reference

This prevents duplicates after retries.

---

## 16. UI Requirements

### Dashboard

Show:

- Total dispatches
- Processing
- Validation errors
- Pending approvals
- Draft invoices
- Completed

### Dispatch Detail

```text
Dispatch
├── Documents
├── Extracted Data
├── Validation
├── Zoho Transaction
├── Approval
└── Audit History
```

### Validation View

Show values side-by-side:

| Field | PO | LR | Weight Slip | WhatsApp | Status |
|---|---|---|---|---|---|
| Vehicle | MH12AB1234 | MH12AB1234 | MH12AB1234 | MH12AB1234 | ✓ |
| Weight | 12500 | - | 12500 | 12500 | ✓ |
| Customer | XYZ | XYZ | - | XYZ | ✓ |

### Approval View

Actions:

- Approve
- Reject
- Request Correction

### Invoice Preview

Show:

- Customer
- PO
- Items
- Quantity
- Selling rate
- GST
- Vehicle
- LR
- Transporter
- Draft status

---

## 17. Business Rules

**BR-01:** Customer PO is the authoritative source for the sales selling rate.

**BR-02:** Purchase rate must not automatically become sales rate.

**BR-03:** Critical document mismatches require human review.

**BR-04:** Invoice creation requires required approval.

**BR-05:** Sales invoices are created only in Draft status.

**BR-06:** Final statutory accounting actions remain with the accountant.

**BR-07:** Duplicate vendor bills must be detected before creation.

**BR-08:** Existing Zoho projects must be reused instead of duplicated.

**BR-09:** Original source values must be retained when normalized values are changed.

**BR-10:** Critical changes must be auditable.

---

## 18. MVP Scope

### Phase 1 — Foundation

- Next.js dashboard
- FastAPI backend
- PostgreSQL/Supabase
- AWS S3
- Authentication
- Dispatch creation
- Document upload

### Phase 2 — AI

- Gemini document extraction
- PDF/image processing
- WhatsApp message parsing
- Structured JSON
- Extraction review UI

### Phase 3 — Validation

- Vehicle validation
- Weight validation
- Customer validation
- PO validation
- Material validation
- Selling-rate validation
- Exception management

### Phase 4 — Zoho

- OAuth
- Customer/vendor lookup
- Project lookup/create
- Purchase bill creation
- Approval workflow
- Draft sales invoice creation

### Phase 5 — Production

- Audit logs
- Retry queues
- Idempotency
- Monitoring
- RBAC
- Security hardening
- Production deployment

---

## 19. Acceptance Criteria

### Document Processing

- All five document types can be uploaded.
- Required fields can be extracted.
- Users can correct extracted fields.

### Validation

- Vehicle mismatches are detected.
- Weight mismatches are detected.
- Customer/PO mismatches are detected.
- Missing required fields are detected.
- Critical errors block invoice creation.

### Zoho

- Existing customers can be found.
- Existing projects can be found.
- Projects can be created when needed.
- Purchase bills can be created without duplication.
- Approval can be recorded.
- Draft sales invoices can be created.

### Pricing

- Customer PO selling rate is used.
- Purchase rate cannot silently overwrite sales rate.
- Applied rate source is recorded.

### Safety

- Invoice remains Draft.
- No automatic e-Invoice/E-Way Bill submission.
- Critical actions are auditable.
- Failed integrations do not create duplicates.

---

## 20. Success Metrics

Initial pilot targets:

- Invoice preparation time reduced by at least 60%.
- Manual data entry reduced by at least 70%.
- Critical-field extraction accuracy target ≥ 95% after validation.
- Duplicate transaction rate = 0.
- Critical mismatch detection target ≥ 98%.

Targets should be measured against real company documents during pilot testing.

---

## 21. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Poor document quality | Human review + validation |
| AI hallucination | Structured schema + deterministic validation |
| Wrong selling rate | Customer PO as authoritative source |
| Zoho API failure | Retry + idempotency |
| Duplicate invoice | Business-key checks |
| WhatsApp integration limitations | Use supported Business Platform/webhook architecture |
| GST/accounting errors | Human approval |
| Sensitive financial documents | Private storage + RBAC + audit logs |
| Vendor/customer name variations | Master-data matching + normalization |

---

## 22. Recommended Development Order

```text
1. Database schema
2. Authentication
3. Document upload
4. S3 storage
5. Gemini extraction
6. Extraction review UI
7. Validation engine
8. Zoho OAuth
9. Customer/Vendor lookup
10. Project creation/linking
11. Purchase Bill creation
12. Approval workflow
13. Draft Sales Invoice
14. PO selling-rate enforcement
15. Audit logs
16. Retry/idempotency
17. WhatsApp integration
18. Production deployment
```

---

## 23. V1 Definition of Done

V1 is complete when a user can:

1. Create a dispatch.
2. Upload required documents.
3. Extract information using AI.
4. Review/correct extracted information.
5. Run cross-document validation.
6. Resolve critical exceptions.
7. Find/create the relevant Zoho Project using the PO.
8. Create the purchase bill.
9. Submit it for admin approval.
10. Approve the transaction.
11. Generate a Sales Invoice using the **Customer PO selling rate**.
12. Save the invoice as **Draft** in Zoho Books.
13. View the generated invoice reference.
14. View the complete audit history.

---

## 24. Future Enhancements

- Automatic document classification
- Advanced master-data matching
- Improved confidence scoring
- Human-feedback learning loop
- Duplicate document detection
- OCR fallback provider
- Email document ingestion
- Advanced WhatsApp workflows
- Analytics dashboard
- Multi-company support
- Multi-warehouse support
- ERP integrations
- Exception prioritization
- Accountant productivity analytics

---

## 25. Final Product Summary

The Automated Draft Invoice Generation System is a **multimodal AI + accounting automation platform**.

Its core pipeline is:

```text
READ
 ↓
UNDERSTAND
 ↓
NORMALIZE
 ↓
VALIDATE
 ↓
APPROVE
 ↓
CREATE
 ↓
SAVE AS DRAFT
```

### Core Technology Stack

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
FastAPI
Python
Gemini API
PostgreSQL / Supabase
AWS S3
Zoho Books API
WhatsApp Business Platform
Redis + Celery
Supabase Auth
Sentry
GitHub
Vercel
Render/Railway
```
