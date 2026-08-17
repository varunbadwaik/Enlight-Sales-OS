# Test Plan & Production Certification — Automated Draft Invoice Generation System

## Test Suite Structure
```text
apps/api/tests/
├── test_validation.py      # Normalization & Rule Engine Unit Tests
├── test_selling_rate.py    # Customer PO Selling Rate Lock Unit Tests
├── test_zoho_draft.py      # Zoho Draft Status Protection Unit Tests
└── test_e2e_workflow.py    # End-to-End Integration & Idempotency Tests
```

---

## Production Certification Matrix

| Test ID | Test Category | Target Component | Expected Result | Status |
|---|---|---|---|---|
| TC-01 | Normalization | `normalizer.py` | `MH 12 AB 1234` → `MH12AB1234` | ✅ PASSED |
| TC-02 | Normalization | `normalizer.py` | `12.5 MT` → `12500 KG` | ✅ PASSED |
| TC-03 | Validation | `validator.py` | Matches vehicle across 4 documents | ✅ PASSED |
| TC-04 | Validation | `validator.py` | Discrepancy triggers `VEHICLE_MATCH` failure | ✅ PASSED |
| TC-05 | Validation | `validator.py` | Net weight diff (0.0%) within 1.0% tolerance | ✅ PASSED |
| TC-06 | Validation | `validator.py` | Net weight diff (4.0%) exceeds 1.0% tolerance | ✅ PASSED |
| TC-07 | Rate Locking | `sales_invoices.py`| Forces line item rate = PO rate ₹58, not bill rate ₹50 | ✅ PASSED |
| TC-08 | Draft Protection | `sales_invoices.py`| Raises `DraftStatusViolationException` if status != draft | ✅ PASSED |
| TC-09 | E2E & Idempotency| `main.py` | Full intake → validation → approval → invoice creation & idempotency check | ✅ PASSED |
