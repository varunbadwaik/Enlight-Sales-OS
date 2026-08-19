# 🚀 Enlight Sales OS — VIBE CODING V2 PLAYBOOK ALIGNMENT & ARCHITECTURE AUDIT

This document evaluates **Enlight Sales OS** against the **Vibe Coding Website + AI Integration Best Practices V2** playbook for production-style AI web applications.

---

## 1. Executive Summary & Core Principle Compliance

| Playbook Rule | Enlight Sales OS Implementation | Status |
|---------------|----------------------------------|--------|
| **Product Before Model** | Business logic (weighbridge matching, rate locking at ₹58.00/kg, dispatch validation) operates deterministically before AI is invoked. | ✅ COMPLIANT |
| **Backend-Controlled AI** | Model provider calls (Gemini 2.5 Flash), Zoho Books OAuth tokens, and Twilio webhooks execute strictly inside backend API boundaries (`apps/api`). No provider keys exist on client. | ✅ COMPLIANT |
| **Zero-Trust Model Boundary** | AI-extracted fields (weight, vehicle #, PO #) pass Pydantic schema validation & normalization (`ValidatorEngine`, `Normalizer`) before database persistence or Zoho Books draft creation. | ✅ COMPLIANT |
| **Data Is Not Instruction** | User-submitted WhatsApp text, image captions, and OCR text are processed as raw data. System instructions and rate lock rules cannot be overridden by user input. | ✅ COMPLIANT |
| **Deterministic Authorization** | Role-Based Access Control (`X-User-Role: Admin | Accountant | Dispatch User`) and Zoho `status: draft` rules are enforced by FastAPI middleware and adapters. | ✅ COMPLIANT |
| **No Fake Success** | If Zoho API returns errors or non-draft status, the adapter throws `DraftStatusViolationException` and displays honest failure logs instead of silent fallbacks. | ✅ COMPLIANT |

---

## 2. Architecture & Trust Boundary Map

```
UNTRUSTED USER INPUT (WhatsApp / Web intake / OCR document upload)
        |
        v
[FASTAPI VALIDATION & NORMALIZATION]
  - Pydantic Schema Validation
  - Vehicle & Weight Normalization
  - Role-Based Access Control (RBAC)
        |
        v
[APPLICATION BUSINESS LOGIC ENGINE]
  - Customer PO Selling Rate Lock (₹58.00/kg)
  - Cross-Document Vehicle Matching (PB vs LR vs Weighbridge)
  - Weight Tolerance Check (<= 1.0%)
        |
        v
[AI ORCHESTRATOR & PROVIDER BOUNDARY]
  - Google Gemini 2.5 Flash Vision OCR
  - Versioned Extraction Prompts
  - Global Token Caching (3600s cache for Zoho OAuth)
        |
        v
[ZOHO BOOKS DRAFT INVOICE ADAPTER]
  - Forced DRAFT status check (`returned_status == 'draft'`)
  - 19-Digit Numerical ID Sanitization
  - Automatic Contact ID Resolution (`4102947000000042014`)
        |
        v
[PERSISTENCE & ACCESSIBLE UI]
  - Next.js Web Dashboard (`/dispatches`, `/invoices`, `/whatsapp`)
  - Real-time Session Sync & Direct Link Routing
```

---

## 3. Threat Model & Security Controls

1. **Prompt Injection Boundary**:
   - Extracted document text and WhatsApp message bodies are passed strictly as JSON payload attributes.
   - System prompts are isolated in backend services (`apps/api/app/services/classifier.py` and `apps/api/app/services/validator.py`).

2. **Output Sanitization & Direct URL Links**:
   - All Zoho Books invoice URLs rendered in the frontend are sanitized via regex (`/^\d+$/`) to ensure only real 19-digit numerical IDs are passed. Invalid strings default to the main Zoho draft list (`https://books.zoho.in/app/60082578964#/invoices`), preventing red error popups.

3. **Rate Limits & Timeout Controls**:
   - Next.js Gateway Proxy timeout set to **25 seconds** (`AbortSignal.timeout(25000)`) to allow full AI parsing & Zoho API calls without request truncation.
   - Global token caching (`GLOBAL_ACCESS_TOKEN`) prevents hitting Zoho's OAuth endpoint continuously, eliminating `400 Access Denied` rate limits.

---

## 4. Verification & Release Quality Gates

- **Automated E2E Suite**: 9/9 Playwright E2E tests passing (`npx playwright test`).
- **Live Intake Verification**: Manual integration script (`scratch/test_manual_full_flow.py`) verified 50 dispatches & 82 Zoho draft invoices in Org `60082578964`.
- **Production Deployment**: Live and ready at [**`https://web-chi-azure-76.vercel.app`**](https://web-chi-azure-76.vercel.app).
