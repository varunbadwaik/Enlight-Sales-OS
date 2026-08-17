# TRD — Automated Draft Invoice Generation System

## 1. Technical Overview

**Product:** Automated Draft Invoice Generation System  
**Version:** V1.0  
**Document Status:** Technical Design / Implementation Specification  
**Primary Workflow Engine:** n8n  
**AI Provider:** Google Gemini API  
**Accounting Platform:** Zoho Books  
**Backend:** Python + FastAPI  
**Database:** PostgreSQL / Supabase  
**Object Storage:** AWS S3  
**Frontend:** Next.js + TypeScript  
**Authentication:** Supabase Auth  
**Monitoring:** Sentry  
**Source Control:** GitHub

### Core Technical Principle

n8n is the **workflow orchestration layer**, while FastAPI contains the **core application/business logic** and deterministic accounting validation rules.

```text
External Events
      ↓
     n8n
      ↓
FastAPI / AI / Storage / Zoho
      ↓
PostgreSQL
      ↓
n8n
      ↓
Human Approval
      ↓
Zoho Books Draft Invoice
```

n8n should orchestrate services, retries, webhooks, notifications, and workflow state transitions. It should not contain complex accounting logic that needs versioning, unit testing, or transactional guarantees.

---

# 2. System Architecture

## 2.1 High-Level Architecture

```text
                    ┌──────────────────────┐
                    │ WhatsApp Business    │
                    │ Platform / Webhook   │
                    └──────────┬───────────┘
                               │
                               ▼
                       ┌──────────────┐
                       │     n8n      │
                       │ Orchestrator │
                       └──────┬───────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
       ┌──────────┐     ┌────────────┐    ┌──────────┐
       │ AWS S3   │     │  FastAPI   │    │ Supabase │
       │ Storage  │     │  Backend   │    │   DB     │
       └──────────┘     └─────┬──────┘    └──────────┘
                              │
                  ┌───────────┼───────────┐
                  ▼                       ▼
             ┌──────────┐           ┌──────────┐
             │ Gemini   │           │ Zoho     │
             │ API      │           │ Books API│
             └──────────┘           └──────────┘

                     ┌────────────────┐
                     │ Next.js Admin  │
                     │ Dashboard      │
                     └───────┬────────┘
                             │
                             ▼
                         FastAPI
```

---

# 3. Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Web App | Next.js | Admin/accountant UI |
| Language | TypeScript | Frontend development |
| UI | Tailwind CSS + shadcn/ui | Interface |
| API | FastAPI | Backend/API |
| Language | Python | AI/business logic |
| Workflow | n8n | Orchestration |
| AI | Google Gemini API | Multimodal document extraction |
| Database | PostgreSQL / Supabase | Persistent data |
| Storage | AWS S3 | Documents/assets |
| Accounting | Zoho Books API | Projects, bills, invoices |
| Messaging | WhatsApp Business Platform | Dispatch messages |
| Auth | Supabase Auth | Authentication |
| Queue | n8n execution queue / optional Redis | Async workflow execution |
| Monitoring | Sentry | Application errors |
| Git | GitHub | Source control |
| Frontend hosting | Vercel | Next.js |
| Backend hosting | Render/Railway | FastAPI |
| Workflow hosting | n8n Cloud or self-hosted n8n | Automation |

---

# 4. Responsibility Boundaries

## 4.1 n8n Responsibilities

n8n owns:

- Webhook ingestion
- Workflow orchestration
- Calling FastAPI endpoints
- Calling Gemini where appropriate
- Calling Zoho APIs where appropriate
- Triggering document processing
- Scheduling/retries
- Approval notifications
- Status transitions
- Sending alerts
- Calling downstream workflows
- Handling simple branching

## 4.2 FastAPI Responsibilities

FastAPI owns:

- Authentication/authorization checks
- Business rules
- Data normalization
- Validation engine
- Accounting rules
- Selling-rate enforcement
- Idempotency
- Database transactions
- Structured AI output validation
- Zoho integration abstraction where complex
- Audit-log creation
- Secure internal APIs

## 4.3 Supabase/PostgreSQL Responsibilities

- Users
- Dispatches
- Documents
- Extracted fields
- Validation results
- Approvals
- Integration jobs
- Audit logs
- Workflow state

## 4.4 AWS S3 Responsibilities

- Original documents
- Processed document copies
- Optional extracted artifacts
- Temporary files

## 4.5 Zoho Books Responsibilities

- Customer master
- Vendor master
- Projects
- Purchase Bills
- Sales Invoices
- Draft invoice records

---

# 5. Core Workflow

## 5.1 End-to-End Flow

```text
1. Dispatch message/document received
             ↓
2. n8n webhook triggered
             ↓
3. Create dispatch record
             ↓
4. Upload/store documents in S3
             ↓
5. Classify documents
             ↓
6. Extract data using Gemini
             ↓
7. Normalize extracted data
             ↓
8. Validate documents
             ↓
9. If errors → Manual Review
             ↓
10. If valid → Zoho lookup
             ↓
11. Find/create PO project
             ↓
12. Prepare purchase bill
             ↓
13. Admin approval
             ↓
14. Retrieve Customer PO selling rate
             ↓
15. Create Sales Invoice
             ↓
16. Force Draft status
             ↓
17. Save Zoho invoice ID
             ↓
18. Notify accountant
```

---

# 6. n8n Workflow Design

The implementation should be split into multiple smaller workflows rather than one very large workflow.

## Workflow 01 — Dispatch Intake

**Trigger:** WhatsApp webhook / application webhook

```text
Webhook
   ↓
Validate Request
   ↓
Extract Message/Files
   ↓
Create Dispatch
   ↓
Store Metadata
   ↓
Download Attachments
   ↓
Upload to S3
   ↓
Trigger Document Processing
```

### n8n nodes

- Webhook
- Code
- HTTP Request
- PostgreSQL/Supabase
- AWS S3
- Execute Workflow

---

# 7. Workflow 02 — Document Processing

**Input:** dispatch_id + document_id

```text
Execute Workflow Trigger
        ↓
Get Document
        ↓
Get S3 File
        ↓
Document Classification
        ↓
Gemini Extraction
        ↓
Validate JSON Schema
        ↓
Save Extracted Fields
        ↓
Trigger Validation Workflow
```

---

# 8. Workflow 03 — Gemini Extraction

Gemini should be used as a multimodal extraction service.

### Input

- PDF
- Image
- Document type
- Extraction schema

### Output

Structured JSON.

Example:

```json
{
  "document_type": "purchase_bill",
  "fields": {
    "vendor_name": "ABC Steel",
    "invoice_number": "INV-12345",
    "invoice_date": "2026-08-10",
    "vehicle_number": "MH12AB1234",
    "quantity": 12500,
    "unit": "KG",
    "purchase_rate": 50,
    "gst_rate": 18
  }
}
```

### AI Rules

The prompt must instruct Gemini:

- Extract only visible information.
- Do not invent missing values.
- Return `null` for missing values.
- Preserve document numbers exactly.
- Return structured JSON.
- Do not calculate accounting decisions.
- Do not determine the final selling rate unless the PO explicitly contains it.

---

# 9. AI Schema Validation

Never trust raw AI output.

Pipeline:

```text
Gemini
  ↓
JSON
  ↓
Pydantic Schema
  ↓
Valid?
 ├── NO → Error
 └── YES
       ↓
Database
```

FastAPI should use Pydantic models.

Example:

```python
class PurchaseBillExtraction(BaseModel):
    vendor_name: str | None
    invoice_number: str | None
    invoice_date: date | None
    vehicle_number: str | None
    quantity: Decimal | None
    unit: str | None
    purchase_rate: Decimal | None
    gst_rate: Decimal | None
```

---

# 10. Workflow 04 — Normalization

Normalization should happen in FastAPI.

Example:

```text
MH 12 AB 1234
      ↓
MH12AB1234
```

```text
12.5 MT
      ↓
12500 KG
```

```text
po-98765
      ↓
PO-98765
```

Keep both:

```text
raw_value
normalized_value
```

---

# 11. Workflow 05 — Validation Engine

Validation must be deterministic.

### Vehicle Rule

```python
vehicles = {
    "purchase_bill": purchase_bill.vehicle,
    "lr": lr.vehicle,
    "weighment": weighment.vehicle,
    "whatsapp": whatsapp.vehicle
}

if not all_match(vehicles):
    create_exception("VEHICLE_MISMATCH")
```

### Weight Rule

```text
Weighment Net Weight
        ↕
WhatsApp Weight
        ↕
Purchase Bill Quantity
```

A configurable tolerance should be supported.

Example:

```text
Allowed tolerance = ±1%
```

The exact tolerance should be configured by business users rather than hard-coded.

### Customer Rule

```text
PO Customer
    ↕
WhatsApp Customer
    ↕
Zoho Customer
```

### PO Rule

```text
PO Number
   ↕
WhatsApp
   ↕
Zoho Project
```

### Material Rule

```text
PO Material
    ↕
Purchase Bill Material
    ↕
WhatsApp Material
```

---

# 12. Workflow 06 — Exception Handling

```text
Validation
    ↓
Passed?
 ┌──┴──┐
YES    NO
 │      │
 ▼      ▼
Next   Exception
        ↓
    Manual Review
        ↓
      Correct
        ↓
    Revalidate
```

n8n should route the workflow based on the validation response.

Example response:

```json
{
  "status": "FAILED",
  "critical": true,
  "errors": [
    {
      "code": "VEHICLE_MISMATCH",
      "message": "Vehicle number differs between LR and weighment slip"
    }
  ]
}
```

---

# 13. Workflow 07 — Zoho Customer/Vendor Lookup

FastAPI or n8n HTTP Request nodes can call Zoho Books.

Recommended approach:

```text
n8n
 ↓
FastAPI
 ↓
Zoho Books Adapter
 ↓
Zoho API
```

FastAPI should own complex Zoho business logic so that Zoho-specific code is not scattered across many n8n workflows.

---

# 14. Zoho OAuth

Use OAuth 2.0.

Credentials should be stored securely in:

- n8n credentials for n8n-owned calls
- Server-side secret management for FastAPI-owned calls

Never store:

```text
ZOHO_CLIENT_SECRET
ZOHO_REFRESH_TOKEN
```

in GitHub or frontend code.

---

# 15. Workflow 08 — Project Lookup/Create

Business key:

```text
Customer PO Number
```

Flow:

```text
Receive PO
   ↓
Search Zoho Project
   ↓
Exists?
 ┌─┴─┐
YES NO
 │   │
 │   ▼
 │ Create Project
 │   │
 └───┘
   ↓
Save Project ID
```

Prevent duplicates using a database unique constraint such as:

```text
company_id + po_number
```

---

# 16. Workflow 09 — Purchase Bill

```text
Validated Dispatch
       ↓
Customer/Vendor Lookup
       ↓
Project Lookup
       ↓
Duplicate Bill Check
       ↓
Create Purchase Bill
       ↓
Save Zoho Bill ID
       ↓
Pending Approval
```

Example internal state:

```text
PURCHASE_BILL_CREATED
```

---

# 17. Workflow 10 — Admin Approval

The approval process should be human-controlled.

```text
Pending Approval
      ↓
Admin Dashboard
      ↓
Review
  ┌───┴────┐
Approve   Reject
   │        │
   ▼        ▼
Continue   Correction
```

Approval record:

```json
{
  "dispatch_id": "uuid",
  "approver_id": "uuid",
  "decision": "APPROVED",
  "comment": "Verified",
  "approved_at": "2026-08-11T10:30:00Z"
}
```

---

# 18. Workflow 11 — Sales Invoice Generation

After approval:

```text
Approved
   ↓
Get Customer PO
   ↓
Get Selling Rate
   ↓
Validate Selling Rate
   ↓
Prepare Invoice Payload
   ↓
Create Zoho Sales Invoice
   ↓
Verify Status
   ↓
Require Draft
   ↓
Save Invoice ID
```

---

# 19. Critical Selling-Rate Rule

The system must explicitly enforce:

```text
Customer PO Selling Rate
            ↓
      SALES INVOICE
```

Not:

```text
Purchase Bill Rate
       ↓
Sales Invoice
```

Example:

```text
Purchase Rate = ₹50/kg
PO Selling Rate = ₹58/kg

Invoice:
Quantity = 12,500 KG
Rate     = ₹58/kg
```

The audit record should contain:

```json
{
  "field": "selling_rate",
  "value": 58,
  "source": "customer_po",
  "source_reference": "PO-98765"
}
```

---

# 20. Draft-Only Enforcement

The invoice service must verify the resulting Zoho invoice status.

Required:

```text
Invoice Created
      ↓
Status = DRAFT
      ↓
PASS
```

If the returned status is not Draft:

```text
FAIL SAFE
↓
STOP WORKFLOW
↓
Create Critical Exception
↓
Notify Admin
```

V1 must never call a finalization/submission operation.

---

# 21. Database Design

## dispatches

```sql
id UUID PRIMARY KEY
po_number VARCHAR(100)
customer_id UUID
dispatch_date DATE
vehicle_number VARCHAR(50)
weight_kg NUMERIC
status VARCHAR(50)
created_at TIMESTAMP
updated_at TIMESTAMP
```

## documents

```sql
id UUID PRIMARY KEY
dispatch_id UUID REFERENCES dispatches(id)
document_type VARCHAR(50)
storage_key TEXT
original_filename TEXT
mime_type VARCHAR(100)
uploaded_by UUID
processing_status VARCHAR(50)
created_at TIMESTAMP
```

## extracted_fields

```sql
id UUID PRIMARY KEY
document_id UUID REFERENCES documents(id)
field_name VARCHAR(100)
raw_value TEXT
normalized_value TEXT
confidence NUMERIC
created_at TIMESTAMP
```

## validation_results

```sql
id UUID PRIMARY KEY
dispatch_id UUID REFERENCES dispatches(id)
rule_name VARCHAR(100)
status VARCHAR(30)
message TEXT
source_values JSONB
resolved_by UUID
resolved_at TIMESTAMP
created_at TIMESTAMP
```

## approvals

```sql
id UUID PRIMARY KEY
dispatch_id UUID REFERENCES dispatches(id)
approver_id UUID
status VARCHAR(30)
comment TEXT
created_at TIMESTAMP
```

## integration_jobs

```sql
id UUID PRIMARY KEY
dispatch_id UUID REFERENCES dispatches(id)
provider VARCHAR(50)
operation VARCHAR(100)
external_id VARCHAR(150)
status VARCHAR(30)
attempt_count INTEGER DEFAULT 0
error_message TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

## audit_logs

```sql
id UUID PRIMARY KEY
dispatch_id UUID
user_id UUID
action VARCHAR(100)
old_value JSONB
new_value JSONB
metadata JSONB
created_at TIMESTAMP
```

---

# 22. Database Constraints

Important constraints:

### Unique vendor bill

```text
vendor_id + vendor_bill_number
```

### Unique project

```text
company_id + po_number
```

### Unique invoice job

```text
dispatch_id + operation
```

### Audit logs

Audit records should be append-only.

---

# 23. API Design

Base URL:

```text
/api/v1
```

## Dispatch

```http
POST /api/v1/dispatches
GET  /api/v1/dispatches/{id}
PATCH /api/v1/dispatches/{id}
```

## Documents

```http
POST /api/v1/dispatches/{id}/documents
GET  /api/v1/documents/{id}
POST /api/v1/documents/{id}/extract
```

## Validation

```http
POST /api/v1/dispatches/{id}/validate
GET  /api/v1/dispatches/{id}/validation
POST /api/v1/exceptions/{id}/resolve
```

## Zoho

```http
POST /api/v1/zoho/project/sync
POST /api/v1/zoho/purchase-bill
POST /api/v1/zoho/sales-invoice/draft
```

## Approval

```http
POST /api/v1/dispatches/{id}/approve
POST /api/v1/dispatches/{id}/reject
```

---

# 24. n8n ↔ FastAPI Contract

n8n should call stable internal endpoints.

Example:

```http
POST /api/v1/workflows/document-processing
```

Payload:

```json
{
  "dispatch_id": "uuid",
  "document_id": "uuid",
  "document_type": "purchase_bill"
}
```

Response:

```json
{
  "success": true,
  "dispatch_id": "uuid",
  "document_id": "uuid",
  "status": "EXTRACTED"
}
```

---

# 25. n8n Error Strategy

Each important workflow should contain:

```text
Main Workflow
     │
     ├── Success
     │
     └── Error Trigger
             ↓
        Save Error
             ↓
        Retry?
       ┌─────┴─────┐
      YES         NO
       │           │
       ▼           ▼
    Retry       Alert Admin
```

Transient errors:

- HTTP 429
- HTTP 500
- Timeout
- Temporary network error

should be retryable.

Business errors:

- Vehicle mismatch
- Missing PO rate
- Customer mismatch
- Duplicate bill

should NOT be blindly retried.

---

# 26. Idempotency

Every external accounting operation must have an idempotency strategy.

Example:

```text
dispatch_id = D123
operation = CREATE_SALES_INVOICE
```

Before calling Zoho:

```text
Does successful integration_jobs record exist?
       ↓
      YES → Return existing Zoho ID
       ↓
       NO → Call Zoho
```

This prevents duplicate invoices when n8n retries.

---

# 27. File Processing

Document flow:

```text
Upload
  ↓
S3
  ↓
Generate signed URL
  ↓
Gemini
  ↓
Extraction
  ↓
Store JSON
```

S3 structure:

```text
bucket/
├── dispatches/
│   └── {dispatch_id}/
│       ├── po/
│       ├── purchase-bill/
│       ├── lr/
│       ├── weighment/
│       └── whatsapp/
```

---

# 28. Security

## Frontend

- HTTPS
- Supabase Auth
- RBAC
- Protected routes
- Server-side authorization

## FastAPI

- JWT verification
- Request validation
- Rate limiting
- CORS restrictions
- Secure headers
- Input validation

## n8n

- HTTPS
- Protected editor
- Encrypted credentials
- Webhook authentication/signatures
- Separate credentials for development and production

## AWS S3

- Private bucket
- No public read access
- Signed URLs
- Encryption at rest

## Zoho

- OAuth 2.0
- Least-privilege scopes
- Secure refresh-token storage

---

# 29. Environment Variables

### Frontend

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
```

### FastAPI

```env
DATABASE_URL=

GEMINI_API_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=

ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_ORGANIZATION_ID=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

SENTRY_DSN=
```

### n8n

Use n8n Credentials for:

- PostgreSQL
- AWS
- Gemini
- Zoho
- HTTP authentication
- WhatsApp

Do not hard-code secrets inside Code nodes.

---

# 30. Observability

Every workflow should expose:

- dispatch_id
- document_id
- workflow execution ID
- integration job ID
- Zoho ID
- error code

Example:

```text
Dispatch: D-10045
n8n Execution: 123456
Document: DOC-2001
Zoho Bill: BILL-789
Zoho Invoice: INV-456
Status: DRAFT
```

Use Sentry for FastAPI/frontend exceptions.

n8n execution history should be retained according to operational/security requirements.

---

# 31. Logging

Use structured logs.

Example:

```json
{
  "timestamp": "2026-08-11T10:30:00Z",
  "service": "invoice-service",
  "dispatch_id": "D-10045",
  "operation": "CREATE_DRAFT_INVOICE",
  "status": "SUCCESS",
  "zoho_invoice_id": "INV-456"
}
```

Never log:

- API secrets
- OAuth refresh tokens
- Full sensitive document contents
- Passwords

---

# 32. Deployment Architecture

```text
                    Internet
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
        Vercel                 n8n
     Next.js App          Cloud/Self-hosted
            │                     │
            └──────────┬──────────┘
                       ▼
                   FastAPI
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Supabase       AWS S3       Gemini
          │
          ▼
      Zoho Books
```

Recommended initial deployment:

- Next.js → Vercel
- FastAPI → Render/Railway
- PostgreSQL → Supabase
- S3 → AWS
- n8n → n8n Cloud or dedicated production instance

---

# 33. n8n Production Recommendations

For production:

- Use a separate production n8n environment.
- Enable authentication/SSO where appropriate.
- Keep credentials in n8n Credentials.
- Use workflow versioning/export backups.
- Use separate dev/staging/prod credentials.
- Avoid huge monolithic workflows.
- Split processing into reusable workflows.
- Use correlation IDs.
- Configure retry policies.
- Monitor failed executions.
- Keep business logic in FastAPI.
- Do not use n8n Code nodes for complex accounting calculations.

Recommended reusable workflows:

```text
WF-01 Dispatch Intake
WF-02 Document Processing
WF-03 Gemini Extraction
WF-04 Validation
WF-05 Zoho Project Sync
WF-06 Purchase Bill
WF-07 Approval
WF-08 Draft Invoice
WF-09 Error Handler
WF-10 Notifications
```

---

# 34. Performance Requirements

Target:

- Standard document upload acknowledgement < 3 seconds.
- Simple API operations < 2 seconds under normal load.
- Document extraction processed asynchronously.
- n8n workflows must not block the frontend request unnecessarily.
- Long-running AI/Zoho operations should use background workflows.
- Dashboard should use polling or event-driven refresh for processing status.

---

# 35. Reliability Requirements

Target:

- No duplicate accounting transactions.
- Failed AI jobs must be retryable.
- Failed Zoho jobs must be retryable.
- Database state must reflect workflow state.
- Critical operations must be idempotent.
- Manual recovery must be available.

---

# 36. Testing Strategy

## Unit Tests

Test:

- Vehicle normalization
- Weight conversion
- PO normalization
- Selling-rate rules
- Validation rules
- Idempotency
- Permission checks

## Integration Tests

Test:

- Gemini extraction
- S3
- Supabase/PostgreSQL
- Zoho Books sandbox/test organization where available
- n8n webhook/API calls

## Workflow Tests

Test:

```text
Happy Path
Document Failure
AI Failure
Validation Failure
Approval Rejection
Zoho Failure
Retry
Duplicate Request
```

## End-to-End Test

Use a complete real-like dispatch package:

```text
PO
+
Purchase Bill
+
LR
+
Weight Slip
+
WhatsApp
```

Expected:

```text
VALIDATED
   ↓
APPROVED
   ↓
DRAFT INVOICE CREATED
```

---

# 37. Security and Accounting Safety Test Cases

### Test 1 — Wrong Vehicle

Expected:

```text
Validation FAILED
Invoice NOT created
```

### Test 2 — Missing PO Rate

Expected:

```text
Invoice NOT created
Exception created
```

### Test 3 — Purchase Rate Different From PO

Expected:

```text
Invoice uses PO selling rate
```

### Test 4 — Zoho API Timeout

Expected:

```text
Retryable integration job
No duplicate invoice
```

### Test 5 — Invoice Returned as Non-Draft

Expected:

```text
Critical exception
Workflow stopped
Admin notified
```

### Test 6 — Duplicate Vendor Bill

Expected:

```text
Existing bill detected
No duplicate bill created
```

---

# 38. Development Folder Structure

Recommended repository:

```text
invoice-automation/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   │
│   └── api/
│       ├── app/
│       │   ├── api/
│       │   ├── core/
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── services/
│       │   ├── validators/
│       │   └── integrations/
│       │       ├── gemini/
│       │       ├── zoho/
│       │       └── s3/
│       └── tests/
│
├── workflows/
│   └── n8n/
│       ├── dispatch-intake.json
│       ├── document-processing.json
│       ├── extraction.json
│       ├── validation.json
│       ├── zoho-project.json
│       ├── purchase-bill.json
│       ├── approval.json
│       ├── draft-invoice.json
│       └── error-handler.json
│
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   └── API.md
│
├── infra/
│   ├── database/
│   └── deployment/
│
├── .env.example
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# 39. API Error Contract

All FastAPI errors should follow a consistent structure.

```json
{
  "success": false,
  "error": {
    "code": "VEHICLE_MISMATCH",
    "message": "Vehicle number does not match across required documents",
    "details": {
      "purchase_bill": "MH12AB1234",
      "lr": "MH12AB5678"
    },
    "retryable": false
  }
}
```

Success:

```json
{
  "success": true,
  "data": {
    "dispatch_id": "D-10045",
    "status": "VALIDATED"
  }
}
```

---

# 40. Recommended n8n Workflow Naming

Use consistent names:

```text
INV-01 — Dispatch Intake
INV-02 — Document Processing
INV-03 — AI Extraction
INV-04 — Validation
INV-05 — Zoho Project Sync
INV-06 — Purchase Bill Creation
INV-07 — Admin Approval
INV-08 — Draft Invoice Creation
INV-09 — Error Handler
INV-10 — Notifications
```

---

# 41. Workflow Correlation

Every workflow execution must carry:

```json
{
  "dispatch_id": "D-10045",
  "workflow_run_id": "N8N-123456",
  "document_id": "DOC-2001"
}
```

This allows support teams to trace:

```text
User Action
   ↓
n8n Execution
   ↓
FastAPI Request
   ↓
Gemini Request
   ↓
Database
   ↓
Zoho Request
```

---

# 42. Key Architectural Decision

## n8n is the Orchestrator, not the Accounting Engine.

Use:

```text
n8n
= WHEN / THEN / CONNECT / RETRY / NOTIFY
```

Use:

```text
FastAPI
= VALIDATE / CALCULATE / AUTHORIZE / PERSIST / ENFORCE
```

Use:

```text
Gemini
= READ / EXTRACT / UNDERSTAND
```

Use:

```text
Zoho Books
= ACCOUNTING SYSTEM OF RECORD
```

Use:

```text
Supabase
= APPLICATION SYSTEM OF RECORD
```

Use:

```text
S3
= DOCUMENT SYSTEM OF RECORD
```

This separation keeps the system maintainable and reduces the risk of incorrect accounting automation.

---

# 43. Final Technical Flow

```text
                 DISPATCH
                    │
                    ▼
              ┌──────────┐
              │   n8n    │
              └────┬─────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
       WhatsApp          Documents
          │                 │
          └────────┬────────┘
                   ▼
                 S3
                   │
                   ▼
                Gemini
                   │
                   ▼
             Structured JSON
                   │
                   ▼
               FastAPI
                   │
                   ▼
             Pydantic Schema
                   │
                   ▼
            Normalization
                   │
                   ▼
          Validation Engine
                   │
             ┌─────┴─────┐
             ▼           ▼
           FAIL         PASS
             │           │
             ▼           ▼
      Manual Review   Zoho Books
                         │
                         ▼
                    Project Sync
                         │
                         ▼
                    Purchase Bill
                         │
                         ▼
                  Admin Approval
                         │
                         ▼
                 Customer PO Rate
                         │
                         ▼
                 Draft Sales Invoice
                         │
                         ▼
                  Accountant Review
```

---

# 44. Technical Definition of Done

V1 technical implementation is complete when:

- Next.js dashboard is authenticated.
- FastAPI APIs are deployed.
- PostgreSQL/Supabase schema is deployed.
- S3 document storage works.
- n8n production workflows are configured.
- Gemini extraction returns schema-valid JSON.
- AI extraction results are stored.
- Deterministic validation works.
- Exceptions block critical workflows.
- Zoho OAuth works.
- Zoho customer/vendor/project lookup works.
- Purchase bill creation is idempotent.
- Admin approval works.
- Customer PO selling rate is enforced.
- Draft Sales Invoice creation works.
- Returned Zoho invoice status is verified as Draft.
- No V1 workflow submits/finalizes invoices.
- Audit logs are generated.
- Failed jobs can be retried safely.
- Monitoring is enabled.
- Production secrets are not committed to GitHub.

---

# 45. Final Architecture Summary

The production architecture should follow this model:

```text
┌──────────────────────────────────────────────┐
│                    USERS                     │
│        Dispatch / Accountant / Admin         │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
                Next.js Dashboard
                       │
                       ▼
                    FastAPI
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
   Supabase          AWS S3          Business
   PostgreSQL        Documents       Services
                                       │
                    ┌──────────────────┼───────────────┐
                    ▼                  ▼               ▼
                 Gemini             Zoho            n8n
                  AI API           Books API       Workflow
                    │                  │               │
                    └──────────────────┴───────────────┘
                                       │
                                       ▼
                              Draft Sales Invoice
```

**Core architectural rule:**

> **n8n orchestrates the workflow, FastAPI enforces business/accounting rules, Gemini extracts information, Supabase stores application state, S3 stores source documents, and Zoho Books remains the accounting system of record.**
