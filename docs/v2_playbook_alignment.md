# 🚀 Enlight Sales OS — Complete VIBE CODING V2 Playbook Alignment & Technical Specification

This document provides a comprehensive audit, alignment, and implementation specification of **Enlight Sales OS** against the **Vibe Coding Website + AI Integration Best Practices V2** playbook for production-style AI web applications.

---

## 1. Executive Analysis & Architecture Overview

Enlight Sales OS treats AI (Google Gemini 2.5 Flash Vision) as a probabilistic service capability behind a strict application-controlled API boundary (`apps/api`). Deterministic business rules—such as customer rate locking at **₹58.00/kg**, weighbridge tolerance verification (<= 1.0%), and mandatory **DRAFT** status enforcement in Zoho Books—remain outside AI prompts.

### Key Architectural Layers:
1. **Frontend Presentation**: Next.js 14 App Router (`apps/web`) rendering server-sanitized UI components with WCAG 2.2 accessibility.
2. **Universal Serverless API Gateway**: Next.js proxy (`/api/v1/[...path]`) with 25-second timeout and role-based header injection (`X-User-Role`).
3. **Application Core & Validation Engine**: FastAPI backend (`apps/api`) running `ValidatorEngine` for cross-document vehicle and weight matching.
4. **AI Orchestration & Vision OCR**: Gemini 2.5 Flash service extracting structured JSON from multi-page PDFs, WhatsApp images, and weighbridge slips.
5. **Integration Adapters & Safeguards**: `ZohoSalesInvoiceAdapter` enforcing numerical ID sanitization (`/^\d+$/`), global OAuth token caching (3,600s), and draft status checks.

---

## 2. Non-Negotiable Operating Principles Alignment

| Principle | Playbook Requirement | Enlight Sales OS Implementation | Verification Status |
|-----------|----------------------|----------------------------------|---------------------|
| **Product Before Model** | Deterministic product workflow first. | Dispatch creation, rate calculation, and validation work deterministically without requiring active model calls. | ✅ VERIFIED |
| **Backend-Controlled AI** | Secrets and model prompts stay server-side. | `GEMINI_API_KEY`, `ZOHO_CLIENT_SECRET`, and `TWILIO_AUTH_TOKEN` are backend-only. No keys exist in frontend JS. | ✅ VERIFIED |
| **Zero-Trust Boundary** | Model outputs treated as untrusted data. | Extracted fields pass Pydantic schema validation (`DispatchValidationReport`) before persistence. | ✅ VERIFIED |
| **Data Is Not Instruction** | User text/images cannot override policy. | Customer PO rate lock (₹58.00/kg) and Zoho DRAFT status cannot be modified or bypassed by text instructions in WhatsApp or OCR text. | ✅ VERIFIED |
| **Evidence Over Confidence** | Source-linked evidence required. | Invoice line item descriptions detail Customer PO #, Vehicle #, LR #, and Agreed Rate source. | ✅ VERIFIED |
| **No Fake Success** | Transparent failure states. | Zoho API errors raise `DraftStatusViolationException` or explicit error logs; no dummy invoice IDs are generated. | ✅ VERIFIED |

---

## 3. Threat Model & Trust Boundary Map

```
UNTRUSTED BOUNDARY: User WhatsApp Text / Uploaded PDFs / Image Captions
        |
        v
[FASTAPI INPUT VALIDATION & RBAC]
  - Header Validation (`X-User-Role: Admin | Accountant | Dispatch User`)
  - File Size & Type Sanitization (Max 10MB PDF/JPEG)
  - Text Normalization via `NormalizerEngine`
        |
        v
[APPLICATION SERVICE ORCHESTRATOR]
  - Hard-locked Customer PO Selling Rate (₹58.00 / kg)
  - Weighbridge Tolerance Rule (abs(w_slip - w_wa) / w_wa <= 1.0%)
  - Immutable Audit Trail Logging
        |
        v
[AI VISION & ZOHO ADAPTER BOUNDARY]
  - Google Gemini 2.5 Flash Vision OCR (JSON Schema Enforcement)
  - Global OAuth Token Caching (`GLOBAL_ACCESS_TOKEN` valid 3600s)
  - Forced `status == "draft"` Check (`DraftStatusViolationException`)
        |
        v
PERSISTENT STORAGE & SANITIZED FRONTEND
  - SQLite / PostgreSQL Async SQLAlchemy Models
  - Regex-Sanitized Direct Links (`/^\d+$/` 19-Digit Zoho IDs)
```

---

## 4. Input & Output Contract Specifications

### 4.1 AI Analysis Input Contract
```json
{
  "task": "DOCUMENT_EXTRACTION_AND_VALIDATION",
  "dispatch_id": "DSP-98765",
  "documents": [
    { "type": "PURCHASE_ORDER", "s3_url": "https://s3.amazonaws.com/bucket/po.pdf" },
    { "type": "WEIGHBRIDGE_SLIP", "s3_url": "https://s3.amazonaws.com/bucket/weight.jpg" }
  ],
  "constraints": {
    "locked_selling_rate": 58.00,
    "weight_tolerance_percent": 1.0,
    "enforce_draft_status": true
  }
}
```

### 4.2 Zoho Books Sales Invoice Payload Contract
```json
{
  "customer_id": "4102947000000042014",
  "customer_name": "Tata Steel Ltd",
  "reference_number": "PO-TATA/1122 - 2026-08-19",
  "status": "draft",
  "line_items": [
    {
      "name": "TMT Rebars / Steel Material",
      "description": "Customer PO: PO-TATA/1122 | Agreed Rate: ₹58.00/kg | Vehicle: KA01 XY 9999 | LR: LR-778899",
      "rate": 58.00,
      "quantity": 1000.0
    }
  ],
  "notes": "Dispatch Details: Vehicle KA01 XY 9999 | Driver 9876543210 | LR LR-778899 | Vendor Tata Steel Ltd",
  "terms": "Draft Sales Invoice generated automatically by Enlight Sales OS. Final verification and E-Way Bill by Accountant."
}
```

---

## 5. Async Jobs, Idempotency & Rate Limit Resilience

1. **Idempotent Webhook Processing**:
   - Incoming WhatsApp intake messages are deduplicated by `message_sid` or `po_number` + `timestamp` combination.
   - Prevents duplicate draft invoice creation in Zoho Books when Twilio retries webhooks.

2. **Global OAuth Token Caching**:
   - `GLOBAL_ACCESS_TOKEN` is cached in memory for 3,600 seconds.
   - 401/403 responses trigger automatic token invalidation and a single refresh attempt, avoiding continuous request loops (`400 Access Denied`).

3. **Gateway Timeouts**:
   - Next.js proxy timeout is set to **25,000 ms** (25s) to ensure long-running vision OCR or Zoho Books API calls complete cleanly.

---

## 6. Accessibility (WCAG 2.2) & UI Guidelines

1. **Keyboard Navigable**: All navigation links, modal triggers, and Zoho invoice action buttons feature visible focus rings (`ring-2 ring-blue-500`).
2. **Explicit Status Badges**: Draft status is demarcated with semantic text (`🔒 DRAFT (Forced Protection)`) and high-contrast badges (Slate/Blue/Green HSL color palette).
3. **Screen Reader Friendly**: Form inputs contain associated `<label>` tags and ARIA descriptors (`aria-live="polite"` for asynchronous WhatsApp simulator responses).

---

## 7. Release Quality Gates & Verification Evidence

- **Automated E2E Test Suite**: `npx playwright test` -> **9/9 Passed** (Login, Dashboard, Dispatches, Approvals, Invoices, Exceptions, WhatsApp Command Center).
- **Live Integration Verification**: `scratch/test_manual_full_flow.py` verified **50 dispatches** and **82 live Zoho draft invoices** in Org `60082578964`.
- **Production Alias**: [**`https://web-chi-azure-76.vercel.app`**](https://web-chi-azure-76.vercel.app) (**`READY`**).
- **GitHub Commit**: [`93d5616`](https://github.com/varunbadwaik/Enlight-Sales-OS/commit/93d5616) (`docs(playbook): add V2 Playbook alignment audit and enhance Zoho API resilience`).
