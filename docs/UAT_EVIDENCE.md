# UAT Execution Log & Evidence Matrix — Automated Draft Invoice Generation System (V1.0) [Phase 6]

## Overview
This document records the official User Acceptance Testing (UAT) execution logs, evidence records, and verification results across all 8 business scenarios.

---

## 📋 UAT Execution Summary Table

| UAT ID | Scenario Name | Input Document Types | Primary Business Gate Verified | Result | Verification Status |
|---|---|---|---|---|---|
| `UAT-001` | Normal Dispatch Happy Path | PO, Bill, LR, Weight Slip, WhatsApp | Full 9 n8n workflow execution | ✅ **PASSED** | Verified (Rate = ₹58, Status = DRAFT) |
| `UAT-002` | Vehicle Mismatch | PO (`MH12AB1234`), LR (`MH12AB9999`) | Validation failure & workflow block | ✅ **PASSED** | Verified (No invoice created) |
| `UAT-003` | Weight Outside Tolerance | Weight Slip (`12,500`), Text (`13,000`) | 1.0% tolerance check (4.0% diff) | ✅ **PASSED** | Verified (`VALIDATION_REQUIRED` flag) |
| `UAT-004` | Missing PO Selling Rate | Customer PO missing rate | Mandatory PO selling rate presence | ✅ **PASSED** | Verified (Invoice creation blocked) |
| `UAT-005` | Vendor Rate Discrepancy | Vendor (`₹50/kg`), PO (`₹58/kg`) | Customer PO Rate Lock (₹58) | ✅ **PASSED** | Verified (Zoho Invoice rate = ₹58) |
| `UAT-006` | Zoho API Failure & Retry | Zoho API HTTP 500 / timeout | n8n Error Handler retry & recovery | ✅ **PASSED** | Verified (No duplicate invoice) |
| `UAT-007` | Concurrent Duplicate Intake | Simultaneous dispatch requests | DB-backed atomic job locks | ✅ **PASSED** | Verified (Single Zoho Invoice ID) |
| `UAT-008` | Admin Rejection | Admin clicks Reject with comment | Admin boundary & state machine | ✅ **PASSED** | Verified (Status = REJECTED) |

---

## 🔍 Detailed Evidence Logs

### UAT-001 — Normal Dispatch Happy Path
- **Date**: 2026-08-11
- **Tester**: Lead Systems Architect & Business Analyst
- **Dispatch ID**: `DSP-001`
- **Input Documents**: `clean_po.pdf`, `clean_bill.pdf`, `clean_lr.pdf`, `clean_slip.jpg`, `standard_message.txt`
- **Expected Result**: Complete workflow execution; Zoho Sales Invoice created with Rate = ₹58/kg and Status = DRAFT.
- **Actual Result**:
  - Dispatch intake created: `DSP-001` (`DOCUMENTS_UPLOADED`).
  - Gemini OCR extraction completed (`EXTRACTED`).
  - Validation engine output: `is_valid = True`, `selling_rate = 58.0` (`VALIDATED`).
  - Admin approval recorded (`APPROVED`).
  - Zoho Purchase Bill created: `bill_zoho_DSP-001`.
  - Zoho Sales Invoice created: `inv_zoho_DSP-001` (`selling_rate_applied = 58.0`, `status = draft`).
  - Notification sent & Audit trail verified.
- **Verification Status**: ✅ **PASSED & VERIFIED**

---

### UAT-005 — Vendor Rate Discrepancy (Rate Lock Safety Test)
- **Date**: 2026-08-11
- **Tester**: Lead Systems Architect & Business Analyst
- **Dispatch ID**: `DSP-005`
- **Input Documents**: Vendor Purchase Bill (Purchase Rate = ₹50.00/kg), Customer PO (Selling Rate = ₹58.00/kg)
- **Expected Result**: Sales Invoice rate MUST be strictly ₹58.00/kg; Vendor rate ₹50.00/kg must never leak into Sales Invoice payload.
- **Actual Result**:
  - Validation engine verified PO selling rate ₹58.00.
  - Draft Invoice adapter applied rate ₹58.00/kg.
  - Post-write reconciliation engine verified `selling_rate_applied == 58.00` and `status == draft`.
- **Verification Status**: ✅ **PASSED & VERIFIED**

---

### UAT-007 — Concurrent Duplicate Intake (Atomic Idempotency)
- **Date**: 2026-08-11
- **Tester**: Lead Systems Architect & Business Analyst
- **Dispatch ID**: `DSP-CONCURRENT-001`
- **Input Payload**: Simultaneous concurrent calls to `POST /create-draft-invoice` for approved dispatch `DSP-CONCURRENT-001`.
- **Expected Result**: Exactly ONE Zoho invoice generated; both concurrent calls return identical Invoice ID (`inv_zoho_DSP-CONCURRENT-001`).
- **Actual Result**: Atomic asyncio job locks held transaction; second request hit idempotency cache and returned identical response.
- **Verification Status**: ✅ **PASSED & VERIFIED**
