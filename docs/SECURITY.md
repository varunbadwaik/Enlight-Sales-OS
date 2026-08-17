# Security & Compliance Specification — Automated Draft Invoice Generation System

## 1. Secrets Management
- All API keys (`GEMINI_API_KEY`, `ZOHO_CLIENT_SECRET`, `AWS_SECRET_ACCESS_KEY`) MUST be injected via environment variables or secret managers (AWS Secrets Manager / Vercel Environment Variables).
- Secrets are NEVER committed to source control (`.gitignore` enforced).

## 2. Object Storage (AWS S3) Security
- AWS S3 bucket `AWS_S3_BUCKET_NAME` is configured with **Private Access Only** (Block Public Access enabled).
- Frontend document viewing uses **temporary S3 Presigned URLs** with expiration = 3600 seconds (1 hour).

## 3. Role-Based Access Control (RBAC)
- Enforced on all FastAPI endpoints via `X-User-Role` header checks:
  - `Admin`: Full access (Intake, Validate, Approve, Create Invoice, View Audit Logs).
  - `Accountant`: Upload, Edit, Validate, View Audit Logs.
  - `Dispatch User`: Upload documents, View Dispatches.
- Backend strictly rejects unauthorized `/approve` or `/create-draft-invoice` attempts with `HTTP 403 Forbidden`.

## 4. Financial & Statutory Safety Guarantees
- **Draft-Only Safeguard**: System raises `DraftStatusViolationException` immediately if Zoho Books returns any status other than `draft`.
- **Customer PO Rate Lock**: Invoice line item rates are hard-locked to the Customer PO rate, preventing purchase rate leakage into sales invoices.
