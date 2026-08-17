# User Acceptance Testing (UAT) Plan — Automated Draft Invoice Generation System (V1.0)

## Overview
This document specifies the 8 User Acceptance Testing (UAT) business scenarios required before production sign-off.

---

## UAT Test Matrix

### Scenario 1: Happy Path Normal Dispatch
- **Input**: Clean PO, Purchase Bill, LR, Weighment slip, WhatsApp text for dispatch `DSP-001`.
- **Expected Outcome**:
  - Vehicle match passed (`MH12AB1234`).
  - Net weight match passed (`12,500 KG`).
  - Customer PO rate applied (`₹58/kg`).
  - Admin approves.
  - Zoho Purchase Bill created.
  - Zoho Sales Invoice created with status **DRAFT** at rate **₹58/kg**.

### Scenario 2: Vehicle Mismatch Exception
- **Input**: PO `MH12AB1234`, LR `MH12AB9999`.
- **Expected Outcome**:
  - Validation status changes to `VALIDATION_REQUIRED` / `VEHICLE_MISMATCH`.
  - Workflow pauses and blocks invoice creation until corrected.

### Scenario 3: Weight Discrepancy Outside Tolerance
- **Input**: Weighment slip `12,500 KG`, WhatsApp text `13,000 KG` (4.0% difference).
- **Expected Outcome**:
  - Validation status changes to `VALIDATION_REQUIRED` / `WEIGHT_TOLERANCE`.
  - Manual review flag generated.

### Scenario 4: Vendor Purchase Rate Discrepancy (PO Selling Rate Override)
- **Input**: Vendor Purchase Bill rate `₹50/kg`, Customer PO rate `₹58/kg`.
- **Expected Outcome**:
  - Sales Invoice rate MUST be strictly `₹58/kg`.
  - Vendor rate (`₹50`) must never leak into Sales Invoice payload.

### Scenario 5: Non-Draft Status Violation
- **Input**: Simulated Zoho response returning status `SENT` or `APPROVED`.
- **Expected Outcome**:
  - `DraftStatusViolationException` raised immediately.
  - Transaction aborted, error logged in audit trail.

### Scenario 6: Concurrent Duplicate Dispatch Intake (Idempotency)
- **Input**: Two identical API calls for `DSP-001` dispatched concurrently.
- **Expected Outcome**:
  - Exactly ONE Zoho Books invoice created.
  - Both requests receive the same Zoho Invoice ID.

### Scenario 7: External Integration Error & Recovery
- **Input**: Temporary network timeout / 503 error on Zoho API call.
- **Expected Outcome**:
  - n8n triggers `08_error_handler` workflow.
  - Request retried cleanly without creating duplicate records.

### Scenario 8: Manual Review & Admin Rejection
- **Input**: Admin clicks `Reject` with comment "Incorrect vehicle documents".
- **Expected Outcome**:
  - Status updated to `REJECTED`.
  - Invoice creation strictly blocked.
