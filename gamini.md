# GEMINI.md — Gemini AI Integration Specification

## 1. Purpose

This document defines how **Google Gemini** will be used in the Automated Draft Invoice Generation System.

Gemini is responsible for **multimodal document understanding and structured information extraction**.

Gemini is **not** the accounting system and must not make final accounting decisions.

### Core principle

```text
Gemini
= READ + EXTRACT + CLASSIFY + NORMALIZE SUPPORT

FastAPI
= VALIDATE + ENFORCE BUSINESS RULES + ACCOUNTING LOGIC

Zoho Books
= ACCOUNTING SYSTEM OF RECORD

n8n
= WORKFLOW ORCHESTRATION
```

---

# 2. Gemini Responsibilities

Gemini will be used for:

1. Document classification
2. PDF/image understanding
3. Purchase bill extraction
4. Customer PO extraction
5. LR extraction
6. Weighment slip extraction
7. Dispatch message parsing
8. Table/line-item extraction
9. Missing-field identification
10. Supporting document comparison
11. Optional document-quality assessment

Gemini must not:

- Decide the final selling price independently.
- Approve accounting transactions.
- Finalize invoices.
- Submit e-Invoices.
- Submit E-Way Bills.
- Replace deterministic validation rules.
- Invent missing document values.

---

# 3. Supported Document Types

The initial implementation supports:

```text
1. Customer Purchase Order
2. Vendor Purchase Bill
3. Lorry Receipt (LR)
4. Weighment Slip
5. WhatsApp Dispatch Message
```

Optional future types:

```text
6. Delivery Challan
7. Transport Invoice
8. GST documents
9. Debit/Credit Notes
10. Supporting delivery documents
```

---

# 4. Gemini Processing Architecture

```text
                 Document
                    │
                    ▼
                   S3
                    │
                    ▼
                 n8n
                    │
                    ▼
             FastAPI Service
                    │
                    ▼
             Document Classifier
                    │
                    ▼
                Gemini API
                    │
                    ▼
            Structured JSON
                    │
                    ▼
             Pydantic Schema
                    │
             ┌──────┴──────┐
             ▼             ▼
           Valid         Invalid
             │             │
             ▼             ▼
        PostgreSQL      Retry/Error
             │
             ▼
       Validation Engine
```

---

# 5. Recommended Gemini Model Strategy

Use a current Gemini multimodal model that supports PDF/image understanding and structured output.

Recommended configuration should be environment-driven rather than hard-coded:

```env
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_MAX_OUTPUT_TOKENS=
GEMINI_TEMPERATURE=
```

For production, pin a tested model version rather than silently switching models.

---

# 6. Input Processing

## 6.1 PDF

Gemini receives the original PDF or an appropriate file representation.

Use PDF processing for:

- Purchase bills
- Customer POs
- LR documents
- Multi-page documents

The system should preserve:

- Page count
- Original file
- Document ID
- Dispatch ID

## 6.2 Images

Supported:

```text
JPEG
PNG
WEBP where supported
```

Images may be:

- Scanned documents
- Photos of bills
- Weight slips
- LR photographs

## 6.3 Text

WhatsApp dispatch messages can be sent as text.

Example:

```text
Purchase From: ABC Steel
Sale To: XYZ Industries
Delivery As Per: PO-98765
DO: DO-123
SO: Rahul
Grade: HR Plate
Size: 10x1500x6300
Weight: 12500 KG
Vehicle No: MH12AB1234
Driver: Ramesh
Transport: XYZ Transport
Dispatch: Pune
```

---

# 7. Document Classification

Before extraction, classify the document.

### Classification output

```json
{
  "document_type": "purchase_bill",
  "confidence": 0.97
}
```

Possible values:

```text
purchase_bill
customer_po
lr
weighment_slip
whatsapp_dispatch
delivery_challan
unknown
```

If confidence is below the configured threshold:

```text
DOCUMENT_CLASSIFICATION_REVIEW
```

The user must be allowed to manually select the document type.

---

# 8. Purchase Bill Extraction

## Required Fields

```text
vendor_name
bill_number
bill_date
vehicle_number
lr_number
material
grade
size
quantity
unit
purchase_rate
taxable_amount
cgst
sgst
igst
gst_rate
total_amount
eway_bill_number
dc_number
```

Fields may be null when unavailable.

### Example Output

```json
{
  "document_type": "purchase_bill",
  "fields": {
    "vendor_name": "ABC Steel",
    "bill_number": "INV-12345",
    "bill_date": "2026-08-10",
    "vehicle_number": "MH12AB1234",
    "lr_number": "LR-16094",
    "material": "HR Plate",
    "grade": "IS 2062",
    "size": "10x1500x6300",
    "quantity": 12500,
    "unit": "KG",
    "purchase_rate": 50,
    "taxable_amount": 625000,
    "cgst": 56250,
    "sgst": 56250,
    "igst": null,
    "gst_rate": 18,
    "total_amount": 737500
  }
}
```

---

# 9. Customer PO Extraction

## Required Fields

```text
customer_name
po_number
po_date
material
grade
size
quantity
unit
selling_rate
currency
delivery_location
delivery_terms
```

### Example

```json
{
  "document_type": "customer_po",
  "fields": {
    "customer_name": "XYZ Industries",
    "po_number": "PO-98765",
    "po_date": "2026-08-01",
    "material": "HR Plate",
    "grade": "IS 2062",
    "size": "10x1500x6300",
    "quantity": 12500,
    "unit": "KG",
    "selling_rate": 58,
    "currency": "INR",
    "delivery_location": "Pune"
  }
}
```

---

# 10. Lorry Receipt Extraction

## Required Fields

```text
lr_number
lr_date
vehicle_number
transporter
consignor
consignee
origin
destination
freight
```

### Example

```json
{
  "document_type": "lr",
  "fields": {
    "lr_number": "LR-16094",
    "lr_date": "2026-08-10",
    "vehicle_number": "MH12AB1234",
    "transporter": "XYZ Transport",
    "consignor": "ABC Steel",
    "consignee": "XYZ Industries",
    "origin": "Nagpur",
    "destination": "Pune"
  }
}
```

---

# 11. Weighment Slip Extraction

## Required Fields

```text
slip_number
date
time
vehicle_number
gross_weight_kg
tare_weight_kg
net_weight_kg
```

### Example

```json
{
  "document_type": "weighment_slip",
  "fields": {
    "slip_number": "WS-9876",
    "date": "2026-08-10",
    "time": "10:32:00",
    "vehicle_number": "MH12AB1234",
    "gross_weight_kg": 25000,
    "tare_weight_kg": 12500,
    "net_weight_kg": 12500
  }
}
```

---

# 12. WhatsApp Dispatch Extraction

Gemini can parse the standardized message into structured data.

### Schema

```json
{
  "purchase_from": null,
  "sale_to": null,
  "delivery_as_per": null,
  "do_number": null,
  "sales_officer": null,
  "grade": null,
  "size": null,
  "weight_kg": null,
  "vehicle_number": null,
  "driver": null,
  "transporter": null,
  "dispatch_location": null
}
```

The model must return `null` rather than guessing.

---

# 13. Structured Output Rules

Every Gemini extraction prompt must require:

1. Valid JSON.
2. No markdown fences.
3. Exact field names.
4. `null` for missing values.
5. No invented values.
6. Preserve source identifiers.
7. Preserve numeric values accurately.
8. Return units explicitly.
9. Separate raw and normalized values where required.
10. Do not make business decisions.

---

# 14. Confidence Strategy

If the selected Gemini API/model configuration supports confidence information, store it.

Example:

```json
{
  "field": "vehicle_number",
  "value": "MH12AB1234",
  "confidence": 0.98
}
```

If reliable model-level confidence is unavailable, do not fabricate a confidence score.

Instead use deterministic quality signals:

```text
FIELD_PRESENT
FIELD_FORMAT_VALID
FIELD_CROSS_DOCUMENT_MATCH
FIELD_SOURCE_AVAILABLE
```

Example:

```json
{
  "field": "vehicle_number",
  "quality": {
    "present": true,
    "format_valid": true,
    "cross_document_match": true
  }
}
```

---

# 15. Extraction Prompt Design

Use a strong system instruction.

### Base Prompt

```text
You are a document data extraction engine for an accounting automation system.

Your task is to extract only information that is visibly present in the supplied document.

Rules:
1. Do not invent or infer missing values.
2. Return null when a field is not present.
3. Preserve invoice numbers, PO numbers, LR numbers and vehicle numbers exactly.
4. Extract numerical values carefully.
5. Preserve the original unit.
6. Return only the requested JSON structure.
7. Do not provide explanations.
8. Do not make accounting decisions.
9. Do not calculate a sales price unless explicitly present in the source document.
10. If a value is unclear, return null and flag the field for review.
```

---

# 16. Purchase Bill Prompt

```text
Extract the following fields from this vendor purchase bill:

vendor_name
bill_number
bill_date
vehicle_number
lr_number
material
grade
size
quantity
unit
purchase_rate
taxable_amount
cgst
sgst
igst
gst_rate
total_amount
eway_bill_number
dc_number

Return JSON only.

Do not infer missing values.
```

---

# 17. Customer PO Prompt

```text
Extract the following fields from this customer purchase order:

customer_name
po_number
po_date
material
grade
size
quantity
unit
selling_rate
currency
delivery_location
delivery_terms

The selling_rate must be copied only if explicitly present in the PO.

Return JSON only.
```

---

# 18. Weighment Prompt

```text
Extract:

slip_number
date
time
vehicle_number
gross_weight_kg
tare_weight_kg
net_weight_kg

If the document uses tonnes/MT, preserve the original value and unit and provide the normalized KG value only when the conversion is unambiguous.

Do not invent missing measurements.

Return JSON only.
```

---

# 19. Post-Gemini Validation

Gemini output must pass through deterministic validation.

```text
Gemini
  ↓
JSON parsing
  ↓
Pydantic
  ↓
Field validation
  ↓
Normalization
  ↓
Cross-document validation
```

Example:

```python
if extracted.vehicle_number:
    validate_vehicle_format(extracted.vehicle_number)
```

---

# 20. Gemini vs Deterministic Rules

| Task | Gemini | FastAPI Rule Engine |
|---|---:|---:|
| Read PDF | ✓ | |
| Read image | ✓ | |
| Extract PO number | ✓ | |
| Extract vehicle | ✓ | |
| Extract weight | ✓ | |
| Extract selling rate | ✓ | |
| Normalize vehicle | | ✓ |
| Compare vehicles | | ✓ |
| Compare weight | | ✓ |
| Validate GST logic | | ✓ |
| Choose sales rate | | ✓ |
| Create Zoho invoice | | ✓ |
| Approve invoice | | ✓ |
| Finalize invoice | | No V1 |

The rule is:

> **Gemini extracts facts; FastAPI decides whether those facts satisfy business rules.**

---

# 21. n8n + Gemini Architecture

Since n8n is the workflow engine:

```text
                 n8n
                  │
                  ▼
          Get S3 Document
                  │
                  ▼
           Gemini API Call
                  │
                  ▼
           Parse JSON Output
                  │
                  ▼
          Call FastAPI
                  │
                  ▼
       Pydantic + Validation
                  │
          ┌───────┴───────┐
          ▼               ▼
        PASS             FAIL
          │               │
          ▼               ▼
     Next Workflow     Exception
```

### Recommended approach

For simple extraction, n8n can call Gemini directly.

For reusable/complex extraction, use:

```text
n8n
 ↓
FastAPI /ai/extract
 ↓
Gemini
 ↓
FastAPI
 ↓
n8n
```

The second approach is recommended for production because prompts, schemas, model configuration, logging, and tests remain version-controlled in the backend.

---

# 22. Gemini API Service

Recommended FastAPI service:

```text
apps/api/app/integrations/gemini/
├── client.py
├── prompts.py
├── schemas.py
├── extractor.py
└── exceptions.py
```

### client.py

Responsibilities:

- Gemini authentication
- API requests
- Timeouts
- Retry handling
- Model configuration

### prompts.py

Contains:

- Base prompt
- PO prompt
- Purchase bill prompt
- LR prompt
- Weighment prompt
- WhatsApp prompt

### schemas.py

Contains Pydantic models.

### extractor.py

Coordinates:

```text
Document
 ↓
Prompt
 ↓
Gemini
 ↓
JSON
 ↓
Schema
```

---

# 23. Gemini Error Handling

Possible errors:

```text
INVALID_ARGUMENT
RATE_LIMIT
TIMEOUT
SERVER_ERROR
CONTENT_UNSUPPORTED
INVALID_JSON
SAFETY_BLOCK
```

Handling:

### Retryable

- Timeout
- Rate limit
- Temporary server error

### Non-retryable

- Unsupported file
- Invalid request
- Invalid schema
- Permanently unreadable document

### Invalid JSON

Attempt:

```text
Gemini Response
      ↓
JSON Parse
      ↓
FAIL
      ↓
Controlled retry with stricter JSON instruction
      ↓
FAIL
      ↓
Manual Review
```

Do not endlessly retry.

---

# 24. Document Quality

Before extraction, optionally evaluate:

```text
Is document readable?
Is the page complete?
Is text/visual information visible?
```

Example:

```json
{
  "quality": "LOW",
  "reason": "Vehicle number area is blurred"
}
```

If quality is too low:

```text
DOCUMENT_QUALITY_REVIEW
```

---

# 25. Multi-Document Reconciliation

Gemini can assist with understanding documents, but the final reconciliation should happen in FastAPI.

Example:

```text
PO:
Vehicle = not available
Customer = XYZ
Rate = ₹58

Purchase Bill:
Vehicle = MH12AB1234
Purchase Rate = ₹50

LR:
Vehicle = MH12AB1234

Weight Slip:
Vehicle = MH12AB1234
Net Weight = 12500 KG

WhatsApp:
Customer = XYZ
Vehicle = MH12AB1234
Weight = 12500 KG
```

FastAPI result:

```json
{
  "status": "VALIDATED",
  "vehicle_match": true,
  "customer_match": true,
  "weight_match": true,
  "selling_rate_source": "customer_po"
}
```

---

# 26. Critical Rule — Selling Rate

Gemini may extract:

```text
Customer PO selling_rate = ₹58/kg
```

But Gemini must not decide:

```text
"Use ₹58 because it seems correct."
```

FastAPI must enforce:

```python
sales_rate = customer_po.selling_rate
```

Then:

```text
Sales Invoice Rate = ₹58/kg
```

This protects against AI hallucination and prevents the vendor purchase rate from being accidentally used.

---

# 27. Data Lineage

Every extracted field should be traceable.

Example:

```json
{
  "field_name": "selling_rate",
  "value": "58",
  "source_type": "customer_po",
  "document_id": "DOC-123",
  "page": 2
}
```

Where page/position metadata is reliably available, store it.

This enables:

```text
Invoice Field
      ↓
Source Field
      ↓
Source Document
      ↓
Original S3 File
```

---

# 28. Prompt Versioning

Prompts must be version-controlled.

Example:

```text
prompts/
├── base_v1.txt
├── purchase_bill_v1.txt
├── customer_po_v1.txt
├── lr_v1.txt
├── weighment_v1.txt
└── whatsapp_v1.txt
```

Store the prompt version with every extraction:

```json
{
  "prompt_version": "purchase_bill_v1",
  "model": "configured-production-model"
}
```

This is important for debugging and auditing.

---

# 29. Extraction Versioning

Store:

```text
model
prompt_version
schema_version
timestamp
document_id
```

Example:

```json
{
  "model": "configured-production-model",
  "prompt_version": "purchase_bill_v1",
  "schema_version": "1.0",
  "document_id": "DOC-123"
}
```

---

# 30. Security

Never expose:

```text
GEMINI_API_KEY
```

to the Next.js client.

Correct:

```text
Next.js
   ↓
FastAPI / n8n
   ↓
Gemini
```

Incorrect:

```text
Browser
   ↓
Gemini API directly
```

API keys must remain server-side.

---

# 31. Cost Control

Gemini usage should be optimized.

Strategies:

1. Do not send the same document repeatedly.
2. Store extraction results.
3. Retry only transient failures.
4. Process only required pages where appropriate.
5. Avoid unnecessarily large prompts.
6. Use smaller/cheaper models for classification when they meet accuracy requirements.
7. Use the higher-capability model for difficult documents.
8. Cache stable extraction results.
9. Never re-extract after a simple human field correction.

Example:

```text
Document uploaded
      ↓
Extract once
      ↓
Store result
      ↓
Human corrects one field
      ↓
Update database
      ↓
NO Gemini call required
```

---

# 32. Observability

For every Gemini call record:

```text
dispatch_id
document_id
workflow_execution_id
model
prompt_version
request_timestamp
response_timestamp
success/failure
error_code
```

Where provider metadata is available and appropriate, also record usage/cost information.

Never store API secrets.

---

# 33. Testing

## Unit Tests

Test:

- JSON parsing
- Pydantic schemas
- Missing fields
- Null values
- Number parsing
- Unit normalization
- Vehicle normalization

## Prompt Tests

Maintain a representative test set:

```text
Clean Purchase Bill
Poor-quality Purchase Bill
Multi-page PO
Scanned PO
Blurry Weight Slip
Different vehicle formats
Different weight units
```

## Regression Tests

Every prompt/model change should run against the test set.

Track:

```text
Field Accuracy
Missing Field Rate
Incorrect Extraction Rate
JSON Failure Rate
Validation Pass Rate
```

---

# 34. Human-in-the-Loop Thresholds

Use configurable thresholds.

Example:

```env
DOCUMENT_CLASSIFICATION_THRESHOLD=0.90
FIELD_REVIEW_THRESHOLD=0.85
```

However, if reliable model confidence is unavailable, use deterministic review triggers instead.

Always require manual review for:

- Missing critical PO number
- Missing selling rate
- Unreadable vehicle number
- Conflicting vehicle numbers
- Conflicting customer
- Conflicting quantity/weight
- Unclear tax-critical information

---

# 35. Recommended AI Pipeline

```text
                 INPUT
                   │
                   ▼
          Document Classification
                   │
                   ▼
             Gemini Extraction
                   │
                   ▼
            Structured JSON
                   │
                   ▼
             Schema Validation
                   │
                   ▼
              Normalization
                   │
                   ▼
           Cross-Document Rules
                   │
            ┌──────┴──────┐
            ▼             ▼
           PASS          FAIL
            │             │
            ▼             ▼
       Zoho Workflow   Human Review
```

---

# 36. Example Complete Extraction

Input documents:

```text
PO
Purchase Bill
LR
Weight Slip
WhatsApp
```

Gemini extracts:

```json
{
  "customer": "XYZ Industries",
  "vendor": "ABC Steel",
  "po_number": "PO-98765",
  "vehicle_number": "MH12AB1234",
  "lr_number": "LR-16094",
  "net_weight_kg": 12500,
  "purchase_rate": 50,
  "selling_rate": 58,
  "transporter": "XYZ Transport"
}
```

FastAPI validates:

```text
Vehicle: PASS
Customer: PASS
Weight: PASS
PO: PASS
Selling Rate: PASS
```

Then:

```text
Zoho Purchase Bill
        ↓
Admin Approval
        ↓
Zoho Sales Invoice
        ↓
Rate = ₹58/kg
        ↓
Status = DRAFT
```

---

# 37. Production Rules

The following rules are mandatory:

### Rule 1

Gemini cannot directly create accounting transactions.

### Rule 2

Gemini cannot approve transactions.

### Rule 3

Gemini cannot choose a sales rate independently.

### Rule 4

Missing values must be `null`.

### Rule 5

Critical conflicts must stop the workflow.

### Rule 6

AI output must be schema validated.

### Rule 7

Original documents must be preserved.

### Rule 8

Extraction metadata must be logged.

### Rule 9

Prompt/model versions must be stored.

### Rule 10

The final invoice must remain Draft in V1.

---

# 38. Implementation Checklist

## Gemini

- [ ] Gemini API key configured
- [ ] Production model selected and pinned
- [ ] Base prompt created
- [ ] PO prompt created
- [ ] Purchase bill prompt created
- [ ] LR prompt created
- [ ] Weighment prompt created
- [ ] WhatsApp prompt created
- [ ] Pydantic schemas created
- [ ] JSON validation implemented
- [ ] Error handling implemented
- [ ] Retry strategy implemented
- [ ] Prompt versioning implemented
- [ ] Extraction logging implemented
- [ ] Test document set created

## n8n

- [ ] Document intake workflow
- [ ] Gemini extraction workflow
- [ ] Validation workflow
- [ ] Error workflow
- [ ] Retry handling
- [ ] Correlation IDs
- [ ] Credential management
- [ ] Production monitoring

## FastAPI

- [ ] Gemini service
- [ ] Pydantic schemas
- [ ] Normalization service
- [ ] Validation engine
- [ ] Audit logging
- [ ] Idempotency
- [ ] Zoho integration

---

# 39. Final Architecture

```text
┌─────────────────────────────────────────────────┐
│                  INPUT SOURCES                   │
│     WhatsApp + PO + Bill + LR + Weight Slip    │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
                    n8n
              Workflow Orchestration
                       │
                       ▼
                     AWS S3
                Original Documents
                       │
                       ▼
                  Gemini API
             Multimodal Extraction
                       │
                       ▼
                Structured JSON
                       │
                       ▼
                  FastAPI
            Schema + Normalization
                       │
                       ▼
              Validation Engine
                       │
                ┌──────┴──────┐
                ▼             ▼
              FAIL           PASS
                │             │
                ▼             ▼
         Human Review     Zoho Books
                              │
                              ▼
                       Admin Approval
                              │
                              ▼
                   Customer PO Selling Rate
                              │
                              ▼
                    Draft Sales Invoice
```

---

# 40. Final Technical Principle

The system must follow this separation:

```text
┌────────────┬────────────────────────────────────┐
│ Component  │ Primary Responsibility             │
├────────────┼────────────────────────────────────┤
│ Gemini     │ Understand documents and extract   │
│            │ source facts                       │
│ n8n        │ Orchestrate workflows              │
│ FastAPI    │ Enforce business/accounting rules  │
│ Supabase   │ Store application state            │
│ AWS S3     │ Store source documents             │
│ Zoho Books │ Accounting system of record        │
│ Next.js    │ User interface                     │
└────────────┴────────────────────────────────────┘
```

**Gemini should be treated as an intelligent document-reading component, not as an autonomous accountant.**
